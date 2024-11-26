from datetime import datetime as dt
from Components.Mongo.mongo_connection import mongoDB_connection
from pymongo import MongoClient
from Components.Model.LLM import LLM

class Worker:

    def __init__(self):
        self.llm: LLM = LLM()

    def process(self, file_id: str):
        try:
            db: MongoClient = mongoDB_connection()
            database = db['nlp-vitae']
            coll = database['files']
            init_time: dt = dt.now()
            file = coll.find_one({'file_id': file_id})

            if file:
                text: str = file['results'][0]['data']

                result = self.llm.ask(text)

                end_time: dt = dt.now()
                duration: float = (end_time - init_time).total_seconds()
                coll.find_one_and_update(
                    {'file_id': file_id},
                    {'$push': { 'results' : {
                        'process' : 'NER',
                        'data' : result,
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