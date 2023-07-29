Приложение создавалось и тестировалось в системе Ubuntu 22.04.2:

![Ubuntu](https://i.imgur.com/YZR0yER.png)

(Required) Установить docker, docker-compose:
```console
sudo apt install curl
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -SL https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

(Optional) Очистить все образы, контейнеры, тома:
```console
sudo docker kill $(sudo docker ps -q)
sudo docker system prune -f
sudo docker system prune -a --volumes
sudo docker volume rm $(sudo docker volume ls -qf dangling=true)
```

(Optional) Закрыть процессы, занимающие проты: 5672, 3000:
```console
sudo kill -9 `sudo lsof -t -i:5672`

sudo kill -9 `sudo lsof -t -i:3000`
```

Войти в корень проекта ./app:
```console
app
├── README.MD
├── .gitignore
├── docker-compose.yml
└── microservice1-producer
    ├── .env    
    ├── Dockerfile
    ├── index.js
    └── package.json
└── microservice2-consumer
    ├── .env    
    ├── Dockerfile
    ├── index.js
    └── package.json
```

Создать образы и развернуть контейнеры, с помощью команды в консоле:
```console
sudo docker-compose up -d --build
```

Для тестирования HTTP запросов, использовался Postman
(Optional) Установить Postman, с помощью команды в консоле:
```console
snap install postman
```

Все контейнеры запущено, можно тестировать.
Алгоритм тестирования через запущенные докер контейнеры (без среды разработки):
1. Открыть логи двух запущенных докер контейнера с микросервисами: microservice1-producer и microservice2-consumer, через консоль:
```console
sudo docker logs --follow <CONTAINER ID> # для первого микросервиса
sudo docker logs --follow <CONTAINER ID> # для второго микросервиса
```
где `<CONTAINER ID>` - ID докер контойнера, который можно просмотреть, с помощью команды в консоле:
```console
sudo docker ps -a
```
2. Дождаться подключения к RabbitMQ серверу, после удачного подключения двух микросервисов, отправлять HTTP запросы.

Пример тестирования:
Пример работы двух микросервисов с одним HTTP запросом             |  Пример работы двух микросервисов с несколькими HTTP запросами
:-------------------------:|:-------------------------:
![DOCKERLOGS1](https://i.imgur.com/RnC4wHm.png)  |  ![DOCKERLOGS2](https://i.imgur.com/xBgA079.png)

<a name="POSTMAN">Пример отправки HTTP запроса через Postman на адрес http://127.0.0.1:3000/send_task с телом запроса</a> |
:-------------------------:|
![POSTMANIMG](https://i.imgur.com/wyUlSdM.png) |

Работу сервера RabbitMQ можно промониторить через UI, путем подключения по адресу http://localhost:15672/ и входа под созданного пользователя с указанными логином и паролем в файле docker-compose.yml (login: rmquser, password: rmqpass)


Пример мониторинга запущенного RabbitMQ сервера             |  Пример мониторинга RabbitMQ обрабатывающего запросы микросервисов
:-------------------------:|:-------------------------:
![RMQ1](https://i.imgur.com/58iKxzn.png)  |  ![RMQ2](https://i.imgur.com/unQ2381.png)

Алгоритм тестирования через среду разработки:
1. Остановить два докер контейнера с запущенными микросервисами, т.к. подеключены к севреу RabbitMQ, и один занимает порт 3000, с помощью команды в консоле:
```console
sudo docker-compose up -d --build
sudo docker container stop <CONTAINER ID> # для первого микросервиса
sudo docker container stop <CONTAINER ID> # для второго микросервиса
```
где `<CONTAINER ID>` - ID докер контойнера, который можно просмотреть, с помощью команды в консоле:
```console
sudo docker ps -a
```
2. (Optional) Установить:
- `Node.js`
```console
sudo apt install nodejs
```
- `npm` (пакетный менеджер  Node.js)
```console
sudo apt install npm
```
- `VSCode`
```console
sudo snap install --classic code
```

3. Запустить среду разработки VSCode, далее открыть корень проекта
```console
code .
```

4. Войти в директорию microservice1-producer, установить библиотеки (тоже самое проделать с папкой microservice2-consumer):
```console
cd microservice1-producer
npm i
```
5. Запустить микросервисы (два раза отдельно для microservice1-producer, microservice2-consumer нужно находится под соответствующей директорией):
```console
node .
```

6. Дождаться запуска и подключения микросервисов к серверу RabbitMQ
7. Отправлять HTTP запросы через Postman на адрес http://127.0.0.1:3000/send_task с телом запроса ([пример](#POSTMAN)) 

Пример работы первого микросервиса microservice1-producer             |  Пример работы второго микросервиса microservice2-consumer
:-------------------------:|:-------------------------:
![LOCAL1](https://i.imgur.com/aH3DeH3.png)  |  ![LOCAL2](https://i.imgur.com/h1nFQmQ.png)