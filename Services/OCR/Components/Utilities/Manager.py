from Components.Mongo.mongo_connection import mongoDB_connection
from pymongo import MongoClient
from Components.Utilities.Worker import Worker

class Manager:

    def __init__(self, worker: Worker=None):
        self.worker: Worker = worker

    def search_for_files(self):
        try:
            print('Searching for oldest File to start processing (OCR) ...')
            db : MongoClient = mongoDB_connection()
            coll = db['nlp-vitae']['files']

            file = coll.find_one(
                {'results': []},
                sort=[('creation_date', 1)]
            )
            if file:
                print(f"File found. file_id: {file['file_id']}. Starting text extraction...")
                self.worker.process(file_id=file['file_id'])
            else:
                print('No file found matching the criteria.')
        except Exception as err:
            print(f'An exception ocurred: {err}')
    
