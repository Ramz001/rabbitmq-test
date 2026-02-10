import amqp from "amqplib";
import 'dotenv/config'

const message = {
  id: 1,
  name: "John Doe",
  email: "johndoe@gmail.com",
};

async function connect() {
  try {
    console.log('Connecting to RabbitMQ...', process.env.RABBITMQ_URI);
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    const channel = await connection.createChannel();
    const result = await channel.assertQueue("jobs");
    channel.sendToQueue("jobs", Buffer.from(JSON.stringify(message)));
    console.log(`Message sent: ${JSON.stringify(message)}`);
  } catch (error) {
    console.error(error);
  }
}

connect();
