from threading import Thread, Event
import time
from Components.Utilities.Manager import Manager

class Timer(Thread):
    
    interval : int

    def __init__(self, interval: int = None):
        self.interval = interval
        self._timer_runs: Event = Event()
        self._timer_runs.set()
        super().__init__()
    
    def run(self):
        while self._timer_runs.is_set():
            self.timer()
            time.sleep(self.interval)
    
    def stop(self):
        self._timer_runs.clear()

class CustomTimer(Timer):

    def __init__(self, interval: int = None, manager: Manager = None):
        super().__init__(interval)
        self.manager = manager

    '''
    Your custom behaviour goes here (timer function).
    '''
    def timer(self):
        if self.manager:
            self.manager.search_for_files()
        else:
            print("Manager instance not provided.")