import amqp from "amqplib";
import "dotenv/config";
import { faker } from "@faker-js/faker";

const message = {
  id: faker.number.int(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
};

async function connect() {
  try {
    console.log("Connecting to RabbitMQ...", process.env.RABBITMQ_URI);
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertQueue("jobs");

    channel.sendToQueue("jobs", Buffer.from(JSON.stringify(message)));
    console.log(`Message sent: ${JSON.stringify(message)}`);

    if (channel) {
      await channel.close();
      console.log("Channel closed");
    }

    if (connection) {
      await connection.close();
      console.log("Connection closed");
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
connect();
