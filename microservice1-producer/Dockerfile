FROM node:latest

WORKDIR /app

COPY package.json .
RUN npm install --quiet

ENV AMQP_SERVER amqp://rmquser:rmqpass@rabbitmq:5672

COPY . .

CMD ["npm", "start"]