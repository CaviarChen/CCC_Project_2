# docker build -t ccc/harvester:latest .
# docker run -p 8080:8080 --name harvester -d ccc/harvester:latest
# docker run --network="host" --name harvester -d ccc/harvester:latest
FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "-u", "./main.py" ]
