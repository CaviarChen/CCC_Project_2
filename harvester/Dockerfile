FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod 777 main_entry.sh

CMD ./main_entry.sh
