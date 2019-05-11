FROM python:3.6

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --upgrade pip
RUN pip install https://github.com/danielgatis/darknetpy/raw/master/dist/darknetpy-4.0-cp36-cp36m-linux_x86_64.whl
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN wget -P ./darknet/ https://pjreddie.com/media/files/yolov3.weights

CMD [ "python", "-u", "./main.py" ]
