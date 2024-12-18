from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from threading import Thread
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

app = FastAPI(title='Swagger for NER Service of NLP-Vitae', lifespan=lifespan)
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
        content={'status' : 'NER Service is OK'}
    )

@app.get('/model', summary='Model Information', description='Returns details of model version used', tags=['Model'])
def tversion() -> JSONResponse:
    try:
        worker: Worker = Worker()
        return JSONResponse(
            status_code= 200,
            content={'message' : worker.model_info()}
        )
    except Exception as err:
        return JSONResponse(
            status_code=500,
            content = {'message' : f'An exception ocurred: {err}'}
        )