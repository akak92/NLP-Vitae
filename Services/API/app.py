from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from gridfs import GridFS
import os
import uuid
import base64
from Components.Mongo.mongo_connection import mongoDB_connection
from Components.Files.file import router as file_router
from datetime import datetime as dt

app = FastAPI(title='API for NLP-Vitae application')
app.include_router(file_router, prefix='/file')

@app.get('/health', summary='Health check endpoint', description="Returns OK value if the service is up.", tags=['Health'])
async def health() -> JSONResponse:
    return JSONResponse(
        status_code=200,
        content={'status' : 'API Service is OK'}
    )


@app.post('/upload', summary='Upload a PDF file and save it in MongoDB', description="Returns OK if the file is uploaded correctly", tags=['Upload'])
async def upload(file: UploadFile = File(...)) -> JSONResponse:
    try:
        path_destination: str = f"uploads/{file.filename}"
        os.makedirs(os.path.dirname(path_destination), exist_ok=True)
        
        file_content: bytes = await file.read()
        
        with open(path_destination, "wb") as f:
            f.write(file_content)

        db: MongoClient = mongoDB_connection()
        fs: GridFS = GridFS(db['nlp-vitae'], collection='documents')
        file_id: uuid.UUID = uuid.uuid4()
        encoded_content: bytes = base64.b64encode(file_content)
        file_base64_id = fs.put(encoded_content, filename=file.filename)

        creation: dt = dt.now()
        coll = db['nlp-vitae']['files']
        file_document = {
            "file_id": str(file_id),
            "file_base64_id": str(file_base64_id),
            "name": file.filename,
            "creation_date": creation.strftime("%d-%m-%Y %H:%M:%S"),
            "results" : []
        }
        coll.insert_one(file_document)

        return JSONResponse(
            status_code=200,
            content={'message': f'File {file.filename} created successfully and loaded in MongoDB.',
                     'file_id' : str(file_id)}
        )

    except Exception as err:
        return JSONResponse(
            status_code=500,
            content={'message': f'An exception occurred: {err}'}
        )