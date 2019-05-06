import time
from maintask import MainTask
import const


def main() -> None:
    while True:
        mainTask = None
        try:
            mainTask = MainTask()
            mainTask.wait()
        finally:
            if mainTask is not None:
                mainTask.abort()
                mainTask.wait()
        print("Main Task Stopped, retry later")
        time.sleep(const.MAINTASK_BACKOFF)


if __name__ == "__main__":
    main()
