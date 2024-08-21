import env from "./env";
import amqp from "amqplib";

async function setupQueueWithRetry() {
  const connection = await amqp.connect(env.RABBIT_URL);
  const channel = await connection.createChannel();

  const topicExchange = "fusion_exchange";
  const topicQueue = "fusion_queue";
  const deadLetterExchange = "dead_letter_exchange";
  const deadLetterQueue = "fusion_dead_letter_queue";

  // Set up the topic exchange
  await channel.assertExchange(topicExchange, "topic", {
    durable: true,
    autoDelete: false,
  });

  // Set up the topic queue
  await channel.assertQueue(topicQueue, { durable: true });
  await channel.bindQueue(topicQueue, topicExchange, "#");

  // Set up the dead-letter exchange
  await channel.assertExchange(deadLetterExchange, "fanout", { durable: true });

  // Set up the dead-letter queue
  await channel.assertQueue(deadLetterQueue, { durable: true });
  await channel.bindQueue(deadLetterQueue, deadLetterExchange, "");

  // Set up a retry delay queue
  await channel.assertQueue("retry_delay_queue", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": topicExchange,
    },
  });

  console.log("Queues and exchanges set up.");

  // Consume messages from the topic queue
  channel.consume(topicQueue, async (msg) => {
    if (msg === null) {
      return;
    }
    const messageContent = JSON.parse(msg.content.toString());
    const routingKey = messageContent.routingKey;
    console.log(`Received message:${routingKey}`);

    try {
      // Simulate processing with potential errors
      if (Math.random() < 0.5) {
        throw new Error("Simulated processing error");
      }
      handleMessage(messageContent);
      // Process the message successfully
      console.log("Message processed successfully");
    } catch (error: any) {
      console.error(`Error processing message: ${error.message}`);

      // Check the number of retry attempts
      const retries = msg.properties.headers["x-retries"] || 0;

      if (retries < 3) {
        // Retry the message with exponential backoff
        const delay = Math.pow(2, retries) * 2000; // Exponential backoff in milliseconds
        console.log(`Retrying in ${delay / 1000} seconds...`);
        channel.sendToQueue("retry_delay_queue", msg.content, {
          headers: {
            "x-retries": retries + 1,
          },
          expiration: delay,
        });
      } else {
        // Max retries reached, send to dead-letter queue
        console.log("Max retries reached. Sending to dead-letter queue.");
        channel.publish(deadLetterExchange, routingKey, msg.content);
      }
    } finally {
      // Acknowledge the message, whether processed or not
      channel.ack(msg);
    }
  });

  console.log("Consumer started.");
}

// Set up the queue and start consuming messages
setupQueueWithRetry();

// handle messages
function handleMessage(msg: any) {
  console.log(`Received message in handler:${msg.routingKey}`);
  console.dir(msg.payload, { depth: 10 });
}
