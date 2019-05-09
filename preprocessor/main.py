from worker import Worker

def main() -> None:
    import image_handler
    image_handler.init()

    worker = Worker(1)
    worker.run()

if __name__ == "__main__":
    main()
