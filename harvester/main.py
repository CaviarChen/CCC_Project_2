import time
from maintask import MainTask
import const


def main() -> None:
    # restart will be handled outside
    mainTask = MainTask()
    mainTask.wait()

if __name__ == "__main__":
    main()
