import amqplib from "amqplib";
import { EXCHANGE_NAME, MESSAGE_BROKER_URL } from "../config/envConfig.js";

export const createChannel = async () => {
    try {
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', false);
        return channel;
    } catch (error) {
        throw error;
    }
}

export const subscribeMessage = async (channel, binding_key) => {
    try {
        const applicationQueue = await channel.assertQueue('REMAINDER_QUEUE');
        channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);
        channel.consume(applicationQueue.queue, msg => {
            console.log("Received data");
            console.log(msg.content.toString());
            channel.ack(msg);
        })
    } catch (error) {
        throw error;
    }

}

export const publishMessage = async (channel, binding_key, message) => {
    try {
        await channel.assertQueue("REMAINDER_QUEUE"); //hard-coded!!!!! queue name
        await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
    } catch (error) {
        throw error;
    }
}