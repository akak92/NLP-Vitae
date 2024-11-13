from fastapi import FastAPI
from fastapi.responses import JSONResponse
import pytesseract

app = FastAPI(title='Swagger for OCR Service of NLP-Vitae')

@app.get('/health', summary='Health check endpoint', description="Returns OK value if the service is up.", tags=['Health'])
def health() -> JSONResponse:
    return JSONResponse(
        status_code=200,
        content={'status' : 'OCR Service is OK'}
    )

@app.get('/tversion', summary='Tesseract version', description='Returns details of tesseract version installed', tags=['Tesseract'])
def tversion() -> JSONResponse:
    try:
        t_version: str = pytesseract.get_tesseract_version()
        return JSONResponse(
            status_code= 200,
            content={'message' : f'Tesseract version : {t_version}'}
        )
    except Exception as err:
        return JSONResponse(
            status_code=500,
            content = {'message' : f'An error ocurred {err}'}
        )