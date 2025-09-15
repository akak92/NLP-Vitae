import requests
class LLM:
    def __init__(self):
        self.url: str = "http://llm:11434/api/generate"

    def ask(self, text: str):
        try:
            system_prompt = """
                Eres un extractor de entidades presentes en Curriculums Vitae. 
                Debes identificar y organizar la información en las siguientes categorías:

                - Datos personales: nombre, correo electrónico, teléfono, dirección.
                - Experiencia laboral: empresa, cargo, período (fecha inicio y fin), logros principales.
                - Educación: institución, título, período (fecha inicio y fin).
                - Habilidades técnicas: lenguajes de programación, herramientas, frameworks, tecnologías.
                - Idiomas: idioma y nivel de dominio.
                - Certificaciones y cursos.
                - Otros: publicaciones, premios, proyectos relevantes.

                Reglas:
                - Devuelve SIEMPRE la información en formato JSON válido.
                - No inventes datos que no estén explícitamente en el texto.
                - Si un campo no está presente, deja el valor como una lista vacía o null.
                - Usa siempre español para los nombres de las claves.
            """
            user_prompt = "Extrae las entidades del siguiente texto: " + text

            payload = {
                "model": "llama3",
                "system_prompt": system_prompt,
                "prompt": user_prompt,
                "stream" : False
            }

            response = requests.post(self.url, json=payload)

            if response.status_code == 200:
                result = response.json()
                return result.get('response')
            else:
                return "Extraction using llama3 failed."
        except Exception as err:
            print(f'An exception occurred: {err}')
            return None