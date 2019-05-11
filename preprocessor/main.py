from worker import Worker
import surburbHandler
import textAnalysis
import time
import threading
import const

def main() -> None:
    import image_handler
    image_handler.init()
    surburbHandler.initialize()
    textAnalysis.initialize()

    for id in range(1, const.NUM_OF_THREAD + 1):
        threading.Thread(target=start_a_thread, args=(id ,)).start()



def start_a_thread(id: int) -> None:
    # sleep different sec before start to reduce the chance of initial conflict
    time.sleep(id)

    worker = Worker(id)
    worker.run()

if __name__ == "__main__":
    main()
