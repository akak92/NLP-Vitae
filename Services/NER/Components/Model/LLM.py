import requests
class LLM:
    def __init__(self):
        self.url: str = "http://llm:11434/api/generate"

    def ask(self, text: str):
        try:
            system_prompt = """
                Eres un extractor de entidades presentes en Curriculums Vitae. Organiza las entidades extraídas en categorías.
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