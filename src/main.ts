import env from "./env";
import amqp from "amqplib";

async function main() {
  const connection = await amqp.connect(env.RABBIT_URL);
  console.log("Connection to RabbitMQ is successful 👍");
  await connection.close();
}
main();
