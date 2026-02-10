import amqp from "amqplib";
import "dotenv/config";
import fs from "fs";
import path from "path";

export async function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function connect() {
  try {
    console.log("Connecting to RabbitMQ...");
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertQueue("jobs");

    console.info("Waiting for messages in 'jobs' queue...");
    channel.consume("jobs", async (msg) => {
      if (!msg) return;

      const content = msg.content.toString();
      const json = JSON.parse(content);
      console.log(`Message received: ${content}`);

      const filePath = path.join(
        process.cwd(),
        "output",
        String(json?.id) || "unknown",
        `${json?.name || "unknown"}.json`,
      );

      await ensureDirectoryExists(path.dirname(filePath));

      fs.writeFile(filePath, content, (err) => {
        if (err) {
          console.error("Error writing file:", err);
          throw err;
        } else {
          console.log(`File saved: ${filePath}`);
        }
      });
      channel.ack(msg);
    });
  } catch (error) {
    console.error(error);
  }
}

connect();
