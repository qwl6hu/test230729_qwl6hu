require('dotenv').config();
require('console-stamp')(console, '[HH:MM:ss.l]');
const amqp = require('amqplib');

let connection, channel;

const consumeTasksFromQueue = async (_, res) => {
    try {
        channel.prefetch(1);
        channel.consume(process.env.TASK_QUEUE, (message) => {
            const task = JSON.parse(message.content.toString());
            console.log(`Processing task: ${JSON.stringify(task)}`);

            // Simulate async processing
            setTimeout(async () => {
                console.log(`task processed: ${JSON.stringify(task)}`);
                task.solution = "solution";
                channel.ack(message);
                await sendSolutionToQueue(channel, task, res)
            }, 5000);
        }, { noAck: false });
    } catch (error) {
        console.error('Error getting task:', error);
    }
};

const sendSolutionToQueue = async (channel, req, res) => {
    try {
        if (!channel) {
            console.log('Failed to add solution to queue (try to reconnect).');
            return;
        }
        let solution = await generateOptionIdentity(req);
        await channel.sendToQueue(process.env.SOLUTION_QUEUE, Buffer.from(JSON.stringify(solution)));
        console.log('solution sent:', JSON.stringify(solution));
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

const generateOptionIdentity = async (task) => {
    return {
        ...task,
        "solution": "solution",
        "date_solution": new Date(),
    }
}

const connectToRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.AMQP_SERVER);
        channel = await connection.createChannel();
        await channel.assertQueue(process.env.TASK_QUEUE);
        await channel.assertQueue(process.env.SOLUTION_QUEUE);
        console.log('Consumer connected to RabbitMQ');
        await consumeTasksFromQueue();
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