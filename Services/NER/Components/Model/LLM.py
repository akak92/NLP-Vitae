import json
import re
import requests
from typing import Any, Dict, Optional, Union
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class LLM:
    """
    Cliente para Ollama (/api/generate y /api/chat) orientado a extracción JSON.

    - Forza salida JSON con `format="json"`.
    - Reduce tiempos muertos con `stream=True` (opcional).
    - Evita truncados con `num_ctx` alto y `num_keep` para proteger el system prompt.
    - Incluye warm-up y keep_alive para mantener el modelo cargado.
    """

    def __init__(
        self,
        base_url: str = "http://llm:11434",
        model: str = "llama3",
        # Usá tu límite real; 800s te cubre warm-ups largos locales
        connect_timeout: int = 10,
        read_timeout: int = 800,
        keep_alive: str = "5m",         # mantiene el modelo cargado en Ollama
        default_num_ctx: int = 8192,    # tamaño de contexto (bajá a 6144 o 4096 si tu HW no da)
        default_num_keep: int = 384,    # tokens del inicio que Ollama NO recorta
        default_temperature: float = 0.0,
    ):
        self.base = base_url.rstrip("/")
        self.url_generate = f"{self.base}/api/generate"
        self.url_chat = f"{self.base}/api/chat"
        self.model = model
        self.timeout = (connect_timeout, read_timeout)
        self.keep_alive = keep_alive
        self.default_num_ctx = default_num_ctx
        self.default_num_keep = default_num_keep
        self.default_temperature = default_temperature

        # Sesión con reintentos (5xx, desconexiones transitorias)
        self.s = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=(500, 502, 503, 504),
            allowed_methods=frozenset(["POST"]),
        )
        self.s.mount("http://", HTTPAdapter(max_retries=retries))
        self.s.mount("https://", HTTPAdapter(max_retries=retries))

        # Prompt de sistema compacto (reglas clave)
        self._SYSTEM = (
            "Extractor de entidades de Currículums Vitae.\n"
            "Devuelve SIEMPRE JSON válido con claves: "
            "datos_personales, experiencia_laboral, educacion, habilidades_tecnicas, "
            "idiomas, certificaciones_y_cursos, otros.\n"
            "No inventes datos; campos ausentes -> [] o null. Claves en español. "
            "Responde SOLO con JSON, sin texto adicional."
        )

    # ---------- Utils ----------
    @staticmethod
    def _shrink(text: str, max_chars: int = 12000) -> str:
        """Limpia ruido y recorta el texto para reducir riesgo de truncado por contexto."""
        import re as _re
        t = text
        t = _re.sub(r"[ \t]+", " ", t)                 # espacios repetidos
        t = _re.sub(r"\n{3,}", "\n\n", t)              # saltos repetidos
        t = _re.sub(r"(?mi)^Página \d+ de \d+.*$", "", t)  # numeración
        t = _re.sub(r"(?m)^\s*•\s*$", "", t)           # bullets vacíos
        return t[:max_chars] if len(t) > max_chars else t

    @staticmethod
    def _coerce_json(text: str) -> Dict[str, Any]:
        """Parsea JSON; si viene rodeado de backticks u otro ruido, extrae el primer {...}."""
        try:
            return json.loads(text)
        except Exception:
            m = re.search(r"\{.*\}", text, flags=re.DOTALL)
            if m:
                return json.loads(m.group(0))
            raise ValueError("La respuesta no contiene JSON parseable")

    # ---------- API pública ----------
    def warm_up(self) -> None:
        """Carga el modelo en memoria para evitar latencias del primer golpe."""
        payload = {
            "model": self.model,
            "system": self._SYSTEM,
            "prompt": "Ok.",
            "stream": False,
            "format": "json",
            "keep_alive": self.keep_alive,
            "options": {
                "temperature": self.default_temperature,
                "num_predict": 1,
                "num_ctx": self.default_num_ctx,
                "num_keep": self.default_num_keep,
            },
        }
        try:
            r = self.s.post(self.url_generate, json=payload, timeout=self.timeout)
            r.raise_for_status()
        except Exception:
            # No interrumpe la app si falla el warm-up; podés loguearlo si querés.
            pass

    def ask(
        self,
        text: str,
        *,
        mode: str = "generate",            # "generate" (default) o "chat"
        max_tokens: int = 1024,
        streaming: bool = False,
        temperature: Optional[float] = None,
        num_ctx: Optional[int] = None,
        num_keep: Optional[int] = None,
        extra_options: Optional[Dict[str, Any]] = None,  # para pasar stops, top_k, etc.
    ) -> Dict[str, Any]:
        """
        Ejecuta la consulta y devuelve SIEMPRE un dict (JSON parseado) o levanta excepción.

        - `streaming=True` acumula chunks del campo "response" y reduce timeouts percibidos.
        - `extra_options` se mergea en `options` (sin pisar los defaults salvo que lo indiques).
        """
        sys = self._SYSTEM
        user_prompt = "Extrae entidades del siguiente CV y responde SOLO JSON:\n" + self._shrink(text)

        opts: Dict[str, Any] = {
            "temperature": self.default_temperature if temperature is None else temperature,
            "num_predict": max_tokens,
            "num_ctx": self.default_num_ctx if num_ctx is None else num_ctx,
            "num_keep": self.default_num_keep if num_keep is None else num_keep,
        }
        if extra_options:
            opts.update(extra_options)

        if mode == "chat":
            url = self.url_chat
            payload: Dict[str, Any] = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": sys},
                    {"role": "user", "content": user_prompt},
                ],
                "stream": streaming,
                "format": "json",
                "keep_alive": self.keep_alive,
                "options": opts,
            }
        else:
            url = self.url_generate
            payload = {
                "model": self.model,
                "system": sys,          # <- clave correcta en /api/generate
                "prompt": user_prompt,
                "stream": streaming,
                "format": "json",
                "keep_alive": self.keep_alive,
                "options": opts,
            }

        try:
            if not streaming:
                resp = self.s.post(url, json=payload, timeout=self.timeout)
                resp.raise_for_status()
                data = resp.json()
                raw = (
                    data.get("message", {}).get("content")
                    if mode == "chat"
                    else data.get("response", "")
                )
                if not raw:
                    raise ValueError("Respuesta vacía del modelo")
                return self._coerce_json(raw)

            # --- Streaming: acumulamos response por líneas JSON ---
            with self.s.post(url, json=payload, timeout=self.timeout, stream=True) as r:
                r.raise_for_status()
                buf: list[str] = []
                for line in r.iter_lines(decode_unicode=True):
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                        piece = (
                            chunk.get("message", {}).get("content")
                            if mode == "chat"
                            else chunk.get("response", "")
                        )
                        if piece:
                            buf.append(piece)
                        if chunk.get("done"):
                            break
                    except Exception:
                        # ruido en el stream → lo ignoramos
                        continue
                full = "".join(buf)
                if not full:
                    raise RuntimeError("Stream sin contenido")
                return self._coerce_json(full)

        except requests.RequestException as e:
            raise RuntimeError(f"Error HTTP consultando al LLM: {e}") from e
        except ValueError as e:
            raise RuntimeError(f"Error parseando JSON del LLM: {e}") from e
