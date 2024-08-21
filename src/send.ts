import env from "./env";
import * as amq from "amqplib";
import { faker } from "@faker-js/faker";

async function send() {
  const connection = await amq.connect(env.RABBIT_URL);
  const channel = await connection.createChannel();
  const msg = {
    routingKey: "events.user.created",
    payload: {
      name: faker.person.fullName(),
      bio: faker.person.bio(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 0, max: 95 }),
    },
  };

  // ensure the exchange exists
  await channel.assertExchange("fusion_exchange", "topic", {
    durable: true,
    autoDelete: false,
  });

  // send message to queue
  function sendToQueue(msg: { routingKey: string; payload: any }) {
    const result = channel.publish(
      "fusion_exchange",
      msg.routingKey,
      Buffer.from(JSON.stringify(msg)),
      {
        persistent: true,
      }
    );
    if (!result) {
      console.error("Failed to send message to queue");
    }
  }
  sendToQueue(msg);
  console.log("Message sent to queue 🚀");
  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 500);
}
send();
