import amqp from "amqplib";
import "dotenv/config";
import readline from "readline";

// Function to ask a question in CLI and return a Promise
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function connect() {
  try {
    // Ask user for message details
    const id = await askQuestion("Enter ID: ");
    const name = await askQuestion("Enter Name: ");
    const email = await askQuestion("Enter Email: ");

    const message = { id: Number(id), name, email };

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
