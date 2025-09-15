import json
import re
import requests
from typing import Any, Dict, Optional, Union

class LLM:
    def __init__(
        self,
        base_url: str = "http://llm:11434",
        model: str = "llama3",
        timeout: int = 800,
    ):
        self.base = base_url.rstrip("/")
        self.url_generate = f"{self.base}/api/generate"
        self.url_chat = f"{self.base}/api/chat"
        self.model = model
        self.timeout = timeout

        # Prompt de sistema (en español, con reglas claras)
        self._SYSTEM = (
            "Eres un extractor de entidades presentes en Currículums Vitae.\n"
            "Debes identificar y organizar la información en las siguientes categorías:\n\n"
            "- Datos personales: nombre, correo electrónico, teléfono, dirección.\n"
            "- Experiencia laboral: empresa, cargo, período (fecha inicio y fin), logros principales.\n"
            "- Educación: institución, título, período (fecha inicio y fin).\n"
            "- Habilidades técnicas: lenguajes de programación, herramientas, frameworks, tecnologías.\n"
            "- Idiomas: idioma y nivel de dominio.\n"
            "- Certificaciones y cursos.\n"
            "- Otros: publicaciones, premios, proyectos relevantes.\n\n"
            "Reglas:\n"
            "- Devuelve SIEMPRE la información en formato JSON válido.\n"
            "- No inventes datos que no estén explícitamente en el texto.\n"
            "- Si un campo no está presente, deja el valor como una lista vacía o null.\n"
            "- Usa siempre español para los nombres de las claves.\n"
            "- Responde ÚNICAMENTE con JSON, sin texto adicional."
        )

    @staticmethod
    def _coerce_json(text: str) -> Dict[str, Any]:
        """Intenta parsear JSON; si viene con '```' u otro ruido, extrae el primer objeto {}."""
        try:
            return json.loads(text)
        except Exception:
            m = re.search(r"\{.*\}", text, flags=re.DOTALL)
            if m:
                return json.loads(m.group(0))
            raise ValueError("La respuesta no contiene JSON parseable")

    def ask(
        self,
        text: str,
        *,
        mode: str = "generate",  # "generate" (default) o "chat"
        max_tokens: int = 1024,
    ) -> Dict[str, Any]:
        """
        Retorna SIEMPRE un dict (JSON parseado) o levanta excepción si falla.
        """
        user_prompt = f"Extrae las entidades del siguiente texto:\n{text}"

        if mode == "chat":
            url = self.url_chat
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": self._SYSTEM},
                    {"role": "user", "content": user_prompt},
                ],
                "stream": False,
                "format": "json",  # fuerza JSON en Ollama
                "options": {
                    "temperature": 0,
                    "num_predict": max_tokens,  # equivalente a max_tokens
                },
            }
        else:
            url = self.url_generate
            payload = {
                "model": self.model,
                "system": self._SYSTEM,      # <- clave correcta en /api/generate
                "prompt": user_prompt,
                "stream": False,
                "format": "json",            # fuerza JSON en Ollama
                "options": {
                    "temperature": 0,
                    "num_predict": max_tokens,
                },
            }

        try:
            resp = requests.post(url, json=payload, timeout=self.timeout)
            resp.raise_for_status()
            data = resp.json()

            # /api/chat → data["message"]["content"]
            # /api/generate → data["response"]
            raw = (
                data.get("message", {}).get("content")
                if mode == "chat"
                else data.get("response", "")
            )
            if not raw:
                raise ValueError("Respuesta vacía del modelo")

            return self._coerce_json(raw)

        except requests.RequestException as e:
            # Podés loguear `payload` si necesitás debug
            raise RuntimeError(f"Error HTTP consultando al LLM: {e}") from e
        except ValueError as e:
            raise RuntimeError(f"Error parseando JSON del LLM: {e}") from e
