from datetime import datetime as dt
from Components.Mongo.mongo_connection import mongoDB_connection
from pymongo import MongoClient
import face_recognition
import fitz
from gridfs import GridFS
from bson import ObjectId
from PIL import Image
import io
import numpy as np
import base64

class Worker:

    def process(self, file_id: str):
        try:
            db: MongoClient = mongoDB_connection()
            database = db['nlp-vitae']
            coll = database['files']
            init_time: dt = dt.now()
            file = coll.find_one({'file_id': file_id})

            if file:
                file_base64_id: str = file['file_base64_id']

                fs: GridFS = GridFS(database, collection='documents')
                file = fs.find_one({'_id': ObjectId(file_base64_id)})

                file_content: bytes = file.read()
                decoded_content = base64.b64decode(file_content)

                pdf = fitz.open("pdf", decoded_content)
                profile_pic = None

                for page_number in range(pdf.page_count):
                    page = pdf[page_number]
                    images = page.get_images(full=True)
                    for img in images:
                        xref = img[0]
                        base_image = pdf.extract_image(xref)
                        image_bytes = base_image["image"]

                        image: Image = Image.open(io.BytesIO(image_bytes))
                        image_rgb = image.convert("RGB")

                        if self._face_detection(image=image_rgb):
                            profile_pic = image_rgb
                            self._save_profile_picture(profile_pic, database)
                            end_time: dt = dt.now()
                            duration = (end_time - init_time).total_seconds()

                            coll.find_one_and_update(
                            {'file_id': file_id},
                            {'$push': { 'results' : {
                                'process' : 'CV',
                                'data' : f'Profile pictured extracted with name: {file_id}.jpg',
                                'duration' : duration
                            }
                            }})
                            print(f'Profile picture found and saved. Stopping further processing.')
                            return

                print(f'No profile picture detected in file_id: {file_id}.')
            else:
                print("No file found with the given file_id.")
                return None
        except Exception as err:
            print(f'An exception occurred: {err}')
            return None

    def _face_detection(self, image: Image):
        image_array = np.array(image)
        faces = face_recognition.face_locations(image_array)
        return len(faces) > 0

    def _save_profile_picture(self, image: Image, database):
        try:
            img_byte_array = io.BytesIO()
            image.save(img_byte_array, format='JPEG')
            img_byte_array = img_byte_array.getvalue()

            # Usar GridFS para guardar la imagen
            fs_pictures = GridFS(database, collection='picture')  # Usar la base de datos correcta
            file_id = fs_pictures.put(img_byte_array, content_type='image/jpeg', filename=f'{file_id}.jpg')

            print(f'Profile picture saved with file_id: {file_id}')
        except Exception as e:
            print(f'Error saving profile picture: {e}')