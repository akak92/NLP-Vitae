from pymongo import MongoClient, collection
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from Components.Mongo.mongo_connection import mongoDB_connection
from datetime import datetime as dt
from typing import Literal
import re
from fastapi import Query


router = APIRouter()

@router.get('/all', summary= 'Returns all files', description= 'Retrieves information for every file present in MongoDB', tags=['Files'])
def get_files():
    try:
        db: MongoClient = mongoDB_connection()
        coll = db['nlp-vitae']['files']
        
        files = list(coll.find().sort('creation_date', -1))

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
    
# --- NUEVO: endpoints de imagen (GridFS) ---

@router.get('/picture/{picture_id}', summary='Get stored profile picture', tags=['Picture'])
def get_picture(picture_id: str, download: bool = False):
    try:
        # imports locales para no tocar la cabecera
        from bson import ObjectId
        from gridfs import GridFS
        from gridfs.errors import NoFile
        from fastapi import Response

        db = mongoDB_connection()['nlp-vitae']
        fs = GridFS(db, collection='picture')

        # validar ObjectId
        try:
            oid = ObjectId(picture_id)
        except Exception:
            return JSONResponse(status_code=400, content={'message': 'picture_id no es un ObjectId válido'})

        try:
            gridout = fs.get(oid)
        except NoFile:
            return JSONResponse(status_code=404, content={'message': 'Imagen no encontrada'})

        data = gridout.read()
        media_type = getattr(gridout, 'content_type', None) or 'image/jpeg'
        filename = getattr(gridout, 'filename', None) or f'{picture_id}.jpg'
        disposition = 'attachment' if download else 'inline'

        headers = {
            'Content-Disposition': f'{disposition}; filename="{filename}"',
            'Cache-Control': 'public, max-age=31536000, immutable',
        }
        etag = getattr(gridout, 'md5', None)
        if etag:
            headers['ETag'] = etag
        upload_date = getattr(gridout, 'upload_date', None)
        if upload_date:
            headers['Last-Modified'] = upload_date.strftime('%a, %d %b %Y %H:%M:%S GMT')

        return Response(content=data, media_type=media_type, headers=headers)

    except Exception as err:
        return JSONResponse(status_code=500, content={'message': f'An exception occurred: {err}'})


@router.get('/picture/by-file/{file_id}', summary='Get profile picture by file_id', tags=['Picture'])
def get_picture_by_file(file_id: str, download: bool = False):
    try:
        from bson import ObjectId
        from gridfs import GridFS
        from gridfs.errors import NoFile
        from fastapi import Response

        db = mongoDB_connection()['nlp-vitae']
        coll = db['files']
        doc = coll.find_one({'file_id': file_id}, {'picture_id': 1})

        if not doc:
            return JSONResponse(status_code=404, content={'message': f'file not found for file_id: {file_id}'})

        picture_id = doc.get('picture_id')

        # Maneja el caso en que guardaste un string tipo "No profile picture was found."
        if not isinstance(picture_id, str) or picture_id.lower().startswith('no profile'):
            return JSONResponse(status_code=404, content={'message': 'El documento no posee una imagen de perfil'})

        fs = GridFS(db, collection='picture')

        try:
            oid = ObjectId(picture_id)
        except Exception:
            return JSONResponse(status_code=400, content={'message': 'picture_id no es un ObjectId válido'})

        try:
            gridout = fs.get(oid)
        except NoFile:
            return JSONResponse(status_code=404, content={'message': 'Imagen no encontrada'})

        data = gridout.read()
        media_type = getattr(gridout, 'content_type', None) or 'image/jpeg'
        filename = getattr(gridout, 'filename', None) or f'{picture_id}.jpg'
        disposition = 'attachment' if download else 'inline'

        headers = {
            'Content-Disposition': f'{disposition}; filename="{filename}"',
            'Cache-Control': 'public, max-age=31536000, immutable',
        }
        etag = getattr(gridout, 'md5', None)
        if etag:
            headers['ETag'] = etag
        upload_date = getattr(gridout, 'upload_date', None)
        if upload_date:
            headers['Last-Modified'] = upload_date.strftime('%a, %d %b %Y %H:%M:%S GMT')

        return Response(content=data, media_type=media_type, headers=headers)

    except Exception as err:
        return JSONResponse(status_code=500, content={'message': f'An exception occurred: {err}'})

@router.get(
    '/filter/skills',
    summary='Filtra archivos por habilidades técnicas',
    description='Devuelve documentos cuyo NER contenga una o varias habilidades técnicas',
    tags=['Files']
)
def get_files_by_skills(
    skills: str = Query(..., description="Lista de habilidades separadas por coma, p.ej.: 'Angular, NodeJS, MongoDB'"),
    mode: Literal['any', 'all'] = Query('any', description="'any' (al menos una) o 'all' (todas)"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    """
    Busca en la estructura:
      results: [
        { process: "NER", data: { habilidades_tecnicas: [ ... ] } },
        ...
      ]

    - mode='any': al menos una habilidad coincide
    - mode='all': deben coincidir todas
    - Case-insensitive y tolera variaciones (usa regex escapado)
    """
    try:
        # Parseo y sanitización de skills
        skills_list = [s.strip() for s in skills.split(',') if s.strip()]
        if not skills_list:
            return JSONResponse(status_code=400, content={'message': 'Debe indicar al menos una habilidad'})

        # Compilo regex case-insensitive escapando caracteres especiales (sirve para "C++", "CSS/Sass", etc.)
        patterns = [re.compile(re.escape(s), re.IGNORECASE) for s in skills_list]

        db: MongoClient = mongoDB_connection()
        coll = db['nlp-vitae']['files']

        elem_match = {'process': 'NER'}

        # Armado de condición sobre el array data.habilidades_tecnicas del elemento NER
        if mode == 'all':
            elem_match['data.habilidades_tecnicas'] = {'$all': patterns}
        else:
            elem_match['data.habilidades_tecnicas'] = {'$in': patterns}

        query = {'results': {'$elemMatch': elem_match}}

        # Paginación
        skip = (page - 1) * limit

        total = coll.count_documents(query)
        cursor = coll.find(query).sort('creation_date', -1).skip(skip).limit(limit)
        files = list(cursor)

        if not files:
            return JSONResponse(
                status_code=404,
                content={'message': 'No files found', 'total': total, 'page': page, 'limit': limit}
            )

        for f in files:
            f['_id'] = str(f['_id'])

        return JSONResponse(
            status_code=200,
            content={
                'data': files,
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'pages': (total + limit - 1) // limit
                },
                'filters': {
                    'skills': skills_list,
                    'mode': mode
                }
            }
        )

    except Exception as err:
        return JSONResponse(
            status_code=500,
            content={'message': f'An exception occurred: {err}'}
        )
