from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from threading import Thread
#from Components.Utilities.Timer import CustomTimer
#from Components.Utilities.Manager import Manager
#from Components.Utilities.Worker import Worker

#_timer: CustomTimer = CustomTimer(manager=Manager(worker=Worker()))

@asynccontextmanager
async def lifespan(app: FastAPI):
    task: Thread = Thread(target=onStart(), daemon=True)
    task.start()
    yield
    onStop()

def onStart():
    try:
        print('Initializing Task (Thread).')
#        _timer.interval = 5
#        _timer.start()
    except Exception as ex:
        print(f'An exception ocurred: {ex}')

def onStop():
    try:
        print('Ending Task (Thread).')
#        _timer.stop()
    except Exception as ex:
        print(f'An exception ocurred: {ex}')

app = FastAPI(title='Swagger for CV Service of NLP-Vitae', lifespan=lifespan)

@app.get('/health', summary='Health check endpoint', description="Returns OK value if the service is up.", tags=['Health'])
def health() -> JSONResponse:
    return JSONResponse(
        status_code=200,
        content={'status' : 'NER Service is OK'}
    )