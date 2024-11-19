from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from threading import Thread
import pytesseract
from Components.Utilities.Timer import CustomTimer
from Components.Utilities.Manager import Manager
from Components.Utilities.Worker import Worker
from fastapi.middleware.cors import CORSMiddleware

_timer: CustomTimer = CustomTimer(manager=Manager(worker=Worker()))

@asynccontextmanager
async def lifespan(app: FastAPI):
    task: Thread = Thread(target=onStart(), daemon=True)
    task.start()
    yield
    onStop()

def onStart():
    try:
        print('Initializing Task (Thread).')
        _timer.interval = 5
        _timer.start()
    except Exception as ex:
        print(f'An exception ocurred: {ex}')

def onStop():
    try:
        print('Ending Task (Thread).')
        _timer.stop()
    except Exception as ex:
        print(f'An exception ocurred: {ex}')

app = FastAPI(title='Swagger for OCR Service of NLP-Vitae', lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            content={'message' : str(t_version)}
        )
    except Exception as err:
        return JSONResponse(
            status_code=500,
            content = {'message' : f'An exception ocurred: {err}'}
        )