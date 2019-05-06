import time
from maintask import MainTask


def main() -> None:
    while True:
        mainTask = None
        try:
            mainTask = MainTask("http://127.0.0.1:5984", "00")
            mainTask.wait()
        finally:
            if mainTask is not None:
                mainTask.abort()
                mainTask.wait()
        print("Main Task Stopped, retry later")
        time.sleep(2*60)


if __name__ == "__main__":
    main()
