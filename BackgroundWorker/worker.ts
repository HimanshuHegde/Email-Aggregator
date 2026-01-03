#!/usr/bin/env node


import amqp, { Message } from 'amqplib/callback_api';
import { createBulkEmails } from './DBFunctions';

amqp.connect(process.env.QUEUE_URL!, function(error0, connection) {
  if(process.env.QUEUE_URL === undefined || process.env.QUEUE_NAME === undefined){
    throw new Error("QUEUE_URL or QUEUE_NAME is not defined in environment variables");
  }
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = process.env.QUEUE_NAME!;

    channel.assertQueue(queue, {
      durable: true
    });
    channel.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, async function(msg) {
      console.log(" [x] Received %s", msg);
      let res = await createBulkEmails(msg?.content.toString() || '[]');
      if(res){
        console.log(" [x] Done");
      }else{
        console.log(" [x] Failed");
      }
      res && channel.ack(msg as Message)
    }, {
      noAck: false
    });
  });
});