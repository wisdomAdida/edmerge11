// rabbitmq.ts
import amqp from 'amqplib';

interface Message {
  queue: string;
  message: any;
}

export class RabbitMQService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(rabbitUrl: string) {
    amqp.connect(rabbitUrl)
      .then((conn) => conn.createChannel())
      .then((ch) => {
        this.connection = ch.connection;
        this.channel = ch;
      })
      .catch((err) => {
        console.error('Failed to connect to RabbitMQ', err);
      });
  }

  // Send message to a specified queue
  public async sendMessage(message: Message) {
    try {
      await this.channel.assertQueue(message.queue);
      this.channel.sendToQueue(message.queue, Buffer.from(JSON.stringify(message.message)));
      console.log(`Sent message to ${message.queue}`);
    } catch (err) {
      console.error('Error sending message to RabbitMQ:', err);
    }
  }
}
