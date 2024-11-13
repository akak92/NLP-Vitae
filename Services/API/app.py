from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title='API for NLP-Vitae application')

@app.get('/health', summary='Health check endpoint', description="Returns OK value if the service is up.", tags=['Health'])
def health():
    return JSONResponse(
        status_code=200,
        content={'status' : 'OK'}
    )