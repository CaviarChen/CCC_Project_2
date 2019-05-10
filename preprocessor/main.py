from worker import Worker
import surburbHandler
import textAnalysis

def main() -> None:
    import image_handler
    image_handler.init()
    surburbHandler.initialize()
    textAnalysis.initialize()
    worker = Worker(1)
    worker.run()

if __name__ == "__main__":
    main()
