from datetime import datetime as dt
from Components.Mongo.mongo_connection import mongoDB_connection
from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId
import base64
import pytesseract
from pdf2image import convert_from_bytes

class Worker:

    def process(self, file_id: str):
        try:
            db: MongoClient = mongoDB_connection()
            database = db['nlp-vitae']  # Seleccionar la base de datos
            coll = database['files']  # Seleccionar la colección
            init_time:dt = dt.now()
            file = coll.find_one({'file_id': file_id})

            if file:
                file_base64_id: str = file['file_base64_id']
                fs: GridFS = GridFS(database, collection='documents')  # Pasar la base de datos en lugar del cliente
                file = fs.find_one({'_id': ObjectId(file_base64_id)})
                file_content: bytes = file.read()
                decoded_content = base64.b64decode(file_content)

                print('Converting to Images in order to use Tesseract...')
                full_text: str = ""

                # Convertir el contenido decodificado (PDF) en imágenes
                pages = convert_from_bytes(decoded_content)

                # Extraer texto de cada página
                for page in pages:
                    text = pytesseract.image_to_string(page, lang='spa')
                    full_text += text + "\n\n"

                end_time: dt = dt.now()
                duration: float = (end_time - init_time).total_seconds()
                coll.find_one_and_update(
                    {'file_id': file_id},
                    {'$push': { 'results' : {
                        'process' : 'OCR',
                        'data' : full_text,
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
