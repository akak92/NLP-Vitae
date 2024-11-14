
from pymongo import MongoClient
import os


def mongoDB_connection() -> MongoClient:
    try:
        conn_uri : str = os.getenv('MONGODB_URI', 'mongodb://nlpadmin:nlppass@mongo:27017')
        client : MongoClient = MongoClient(conn_uri)
    except Exception as err:
        print(f'An error ocurred: {err}')
    return client