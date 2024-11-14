from Components.Mongo.mongo_connection import mongoDB_connection
from pymongo import MongoClient
from Components.Utilities.Worker import Worker

class Manager:

    def __init__(self, worker: Worker=None):
        self.worker: Worker = worker

    def search_for_files(self):
        try:
            print('Searching for oldest File to start processing (NER) ...')
        except Exception as err:
            print(f'An exception ocurred: {err}')
    
