require('dotenv').config();
require('console-stamp')(console, '[HH:MM:ss.l]');
const amqp = require('amqplib');
const express = require('express');
const app = express();

let connection, channel;
var Id = 0;

app.use(express.json());

app.post('/send_task', async (req, res) => {
    await sendTaskToQueue(req, res);
});

app.listen(3000, () => {
    console.log('Server started, listening on port 3000');
});

const generateOptionIdentity = async (task) => {
    return {
        "id": Id++,
        ...task,
        "date_task": new Date()
    }
}

const sendTaskToQueue = async (req, res) => {
    try {
        if (!channel) {
            console.log('Failed to add task to queue (try to reconnect).');
            res.status(500).json({ message: 'Failed to add task to queue.' });
            return;
        }
        setTimeout(async () => {
            let task = await generateOptionIdentity(req.body);
            await channel.sendToQueue(process.env.TASK_QUEUE, Buffer.from(JSON.stringify(task)));
            console.log('Task sent:', JSON.stringify(task));
        }, 1000);
        res.status(200).json({ message: 'Task added to the queue.' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to add task to queue.' });
    }
};

const consumeSolutionsFromQueue = async (_, res) => {
    try {
        channel.prefetch(1);
        channel.consume(process.env.SOLUTION_QUEUE, (message) => {
            const task = JSON.parse(message.content.toString());
            console.log(`Receiving solution: ${JSON.stringify(task)}`);

            // Simulate async processing
            setTimeout(() => {
                console.log(`solution received: ${JSON.stringify(task)}`);
                channel.ack(message);
            }, 5000);
        });
} catch (error) {
        console.error('Error getting messages:', error);
    }
};

const connectToRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.AMQP_SERVER);
        channel = await connection.createChannel();
        await channel.assertQueue(process.env.TASK_QUEUE);
        await channel.assertQueue(process.env.SOLUTION_QUEUE);
        console.log('Producer connected to RabbitMQ');
        await consumeSolutionsFromQueue();
    } catch (error) {
        await reconnect();
    }
}

async function reconnect() {
    console.warn('Reconnecting to RabbitMQ:', process.env.AMQP_SERVER);
    setTimeout(await connectToRabbitMQ, 1000);
}

(async () => {
    await connectToRabbitMQ();
})();