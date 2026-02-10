import amqp from "amqplib";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { ensureDirectoryExists, sleep, sanitizeFilename } from "./utils.js";

async function connect() {
  try {
    console.log("Connecting to RabbitMQ...");
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertQueue("jobs");
    await channel.prefetch(1);

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
        `${sanitizeFilename(json?.name || "unknown")}.json`,
      );

      await ensureDirectoryExists(path.dirname(filePath));

      await sleep(10000);

      await fs.writeFile(filePath, content, (err) => {
        if (err) {
          throw err;
        }
      });

      console.info(`Job done: ${json.id}`);
      channel.ack(msg);
    });
  } catch (error) {
    console.error(error);
  }
}

connect();
