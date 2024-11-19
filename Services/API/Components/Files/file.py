from pymongo import MongoClient, collection
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from Components.Mongo.mongo_connection import mongoDB_connection
from datetime import datetime as dt

router = APIRouter()

@router.get('/all', summary= 'Returns all files', description= 'Retrieves information for every file present in MongoDB', tags=['Files'])
def get_files():
    try:
        db: MongoClient = mongoDB_connection()
        coll = db['nlp-vitae']['files']
        
        files = list(coll.find())

        if files:
            for file in files:
                file['_id'] = str(file['_id'])

            return JSONResponse(
                status_code=200,
                content={'data': files}
            )
        else:
            return JSONResponse(
                status_code=404,
                content={'message': 'No files found'}
            )
    except Exception as err:
        return JSONResponse(
            status_code=500,
            content={'message': f'An exception occurred: {err}'}
        )

@router.get('/filter/id/{file_id}', summary= 'Returns an specific file information', description='It retrieves a file information from MongoDB', tags=['Files'])
def get_file(file_id: str):
    try:
        db: MongoClient = mongoDB_connection()
        coll = db['nlp-vitae']['files']
        file = coll.find_one({'file_id' : file_id})
        if file is not None:
            file['_id'] = str(file['_id'])
            return JSONResponse(
                status_code=200,
                content={'data' : file}
            )
        if file is None:
            return JSONResponse(
                status_code=404,
                content={'message' : f'file not found for file_id: {file_id}'}
            )
    except Exception as err:
        return JSONResponse(
            status_code=500,
            content={'message': f'An exception occurred: {err}'}
        )
    
@router.get('/filter/date/{creation_date}', summary='Returns files information for a specific date', description="It retrieves file information from MongoDB using a date as filter", tags=['Files'])
def get_files(creation_date: str):
    try:
        try:
            date_obj = dt.strptime(creation_date, "%d-%m-%Y")
            date_str = date_obj.strftime("%d-%m-%Y")
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={'message': 'Invalid date format. Use dd-MM-yyyy'}
            )
        
        db: MongoClient = mongoDB_connection()
        coll = db['nlp-vitae']['files']
        
        files = list(coll.find({'creation_date': {'$regex': f'^{date_str}'}}))

        if files:
            for file in files:
                file['_id'] = str(file['_id'])

            return JSONResponse(
                status_code=200,
                content={'data': files}
            )
        else:
            return JSONResponse(
                status_code=404,
                content={'message': 'No files found'}
            )
    except Exception as err:
        return JSONResponse(
            status_code=500,
            content={'message': f'An exception occurred: {err}'}
        )