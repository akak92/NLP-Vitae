from datetime import datetime as dt
from io import BytesIO
from Components.Mongo.mongo_connection import mongoDB_connection
from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId
import base64

# Docling
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat, DocumentStream
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
    EasyOcrOptions,  # backend OCR EasyOCR
)

class Worker:

    def __init__(self, enable_ocr_fallback: bool = True, easyocr_langs: list[str] = None):
        """
        enable_ocr_fallback: si True, si el PDF no tiene texto embebido
                             reintenta con OCR (EasyOCR).
        easyocr_langs: lista de idiomas para EasyOCR. Ej: ["es", "en"]
        """
        self.enable_ocr_fallback = enable_ocr_fallback
        self.easyocr_langs = easyocr_langs or ["es"]  # español por defecto

    def _convert_with_docling(
        self,
        pdf_bytes: bytes,
        do_ocr: bool = False,
        ocr_backend: str = "easyocr",
    ) -> tuple[str, str]:
        """
        Retorna (texto, backend_usado)
        backend_usado: "no_ocr" | "easyocr"
        """
        if do_ocr:
            if ocr_backend == "easyocr":
                pipeline = PdfPipelineOptions(
                    do_ocr=True,
                    # Si sospechás páginas escaneadas, esto ayuda:
                    # force_full_page_ocr=True,
                    ocr_options=EasyOcrOptions(lang=self.easyocr_langs),
                )
                backend_used = "easyocr"
            else:
                raise ValueError(f"OCR backend no soportado: {ocr_backend}")
        else:
            pipeline = PdfPipelineOptions(do_ocr=False)
            backend_used = "no_ocr"

        converter = DocumentConverter(
            format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline)}
        )

        stream = DocumentStream(name="input.pdf", stream=BytesIO(pdf_bytes))
        result = converter.convert(stream)

        # Elegí: texto plano o markdown
        text = result.document.export_to_text()
        # Si te interesa conservar estructura (títulos, listas, tablas):
        # text = result.document.export_to_markdown()

        return text, backend_used

    def process(self, file_id: str):
        try:
            db: MongoClient = mongoDB_connection()
            database = db['nlp-vitae']
            coll = database['files']
            init_time: dt = dt.now()

            file_doc = coll.find_one({'file_id': file_id})
            if not file_doc:
                print("No file found with the given file_id.")
                return None

            file_base64_id: str = file_doc['file_base64_id']
            fs: GridFS = GridFS(database, collection='documents')
            fs_file = fs.find_one({'_id': ObjectId(file_base64_id)})
            file_content: bytes = fs_file.read()
            decoded_content = base64.b64decode(file_content)

            # 1) Intento SIN OCR (PDF nativo)
            print('Docling: intentando extracción sin OCR...')
            text, backend = self._convert_with_docling(decoded_content, do_ocr=False)

            # 2) Fallback a OCR con EasyOCR si quedó vacío y está habilitado
            if self.enable_ocr_fallback and not text.strip():
                print('Docling: texto vacío; reintentando con OCR (EasyOCR)...')
                text, backend = self._convert_with_docling(
                    decoded_content,
                    do_ocr=True,
                    ocr_backend="easyocr",
                )

            end_time: dt = dt.now()
            duration: float = (end_time - init_time).total_seconds()

            coll.find_one_and_update(
                {'file_id': file_id},
                {'$push': {'results': {
                    'process': 'Docling',
                    'ocr_backend': backend,      # "no_ocr" o "easyocr"
                    'data': text,
                    'duration': duration,
                    'timestamp': end_time.isoformat(timespec='seconds')
                }}}
            )

            print(f'File with file_id: {file_id} processed correctly. Backend: {backend}.')

        except Exception as err:
            print(f'An exception occurred: {err}')
            return None
