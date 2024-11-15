from datetime import datetime as dt
from Components.Mongo.mongo_connection import mongoDB_connection
from pymongo import MongoClient
from transformers import pipeline, AutoModelForTokenClassification, AutoTokenizer

class Worker:

    def __init__(self):
        self.model_path = './Model'
        self.model = AutoModelForTokenClassification.from_pretrained(self.model_path)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)

    def process(self, file_id: str):
        try:
            db: MongoClient = mongoDB_connection()
            database = db['nlp-vitae']
            coll = database['files']
            init_time: dt = dt.now()
            file = coll.find_one({'file_id': file_id})

            if file:
                path: str = './Model'

                ner_model = pipeline("ner", model=self.model, tokenizer=self.tokenizer, aggregation_strategy="simple")
                text: str = file['results'][0]['data']
                
                # Usamos max_length para tokens = 256
                max_length = 256

                inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=max_length)
                
                input_ids = inputs['input_ids'][0]

                if len(input_ids) > max_length:
                    print(f"Truncating tokens, total tokens: {len(input_ids)}")
                    input_ids = input_ids[:max_length]

                chunk_size = max_length - 2  # Restamos 2 para los tokens [CLS] y [SEP]
                chunks = [input_ids[i:i + chunk_size] for i in range(0, len(input_ids), chunk_size)]

                # Almacenar los resultados de cada fragmento
                all_entities = []

                for chunk in chunks:
                    chunk_text = self.tokenizer.decode(chunk, skip_special_tokens=True)
                    entities = ner_model(chunk_text)
                    all_entities.extend(entities)

                filtered_entities = [
                    {**entity, 'score': float(entity['score'])}
                    for entity in all_entities if entity['score'] >= 0.90 and len(entity['word']) > 3
                ]

                end_time: dt = dt.now()
                duration: float = (end_time - init_time).total_seconds()
                coll.find_one_and_update(
                    {'file_id': file_id},
                    {'$push': { 'results' : {
                        'process' : 'NER',
                        'data' : filtered_entities,
                        'duration' : duration
                    }
                    }})

                print(f'File with file_id: {file_id} processed correctly.')
            else:
                print("No file found with the given file_id.")
                return None
        except Exception as err:
            print(f'An exception occurred: {err}')
            return None

    def model_info(self):
        model_info = {
            "model_name": self.model.config.model_type,
            "model_architecture": self.model.config.architectures,
            "num_labels": self.model.config.num_labels,
            "tokenizer_vocab_size": len(self.tokenizer),
            "model_path": self.model_path,
            "model_loaded": True,
        }
        return model_info