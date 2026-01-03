import amqp from "amqplib/callback_api";
import { Email } from "../../types/email";

let channel: amqp.Channel | null = null;

export function initQueue() {
  if(process.env.QUEUE_URL === undefined || process.env.QUEUE_NAME === undefined){
    throw new Error("QUEUE_URL or QUEUE_NAME is not defined in environment variables");
  }
  console.log(process.env.QUEUE_URL);
  amqp.connect(process.env.QUEUE_URL!, function (error0, connection) {
    if (error0) throw error0;

    connection.createChannel(function (error1, ch) {
      if (error1) throw error1;

      ch.assertQueue(process.env.QUEUE_NAME!, { durable: true });

      // IMPORTANT: assign to global var
      channel = ch;

      console.log("Queue initialized");
    });
  });
}

export function sendToQueue(emailData: Email[]) {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized yet");
  }

  channel.sendToQueue(
    "task_queue",
    Buffer.from(JSON.stringify(emailData)),
    { persistent: true }
  );

  console.log("Sent", emailData.length, "emails");
}
