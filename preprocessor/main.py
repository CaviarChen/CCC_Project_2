from worker import Worker

def main() -> None:
    worker = Worker(1)
    worker.run()

if __name__ == "__main__":
    main()
