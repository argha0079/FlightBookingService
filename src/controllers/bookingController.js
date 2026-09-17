import { StatusCodes } from "http-status-codes";
import BookingService from "../services/bookingService.js";
import { createChannel, publishMessage } from "../utils/messageQueue.js";
import { REMAINDER_BINDING_KEY } from "../config/envConfig.js";

const bookingService = new BookingService();

export class BookingController {
    constructor() {
    }
    async sendMessageToQueue (req, res) {
        try {
            const channel = await createChannel()
            const data = { message: "SUCCESS"};
            publishMessage(channel, REMAINDER_BINDING_KEY, JSON.stringify(data));
            return res.status(200).json({
                message: "Successfully published the event"
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
                success: false,
                err: {},
                data: {}
            });
        }
    }
    async create(req, res) {
        try {
            const response = await bookingService.createBooking(req.body);
            return res.status(StatusCodes.OK).json({
                data: response,
                success: true,
                message: "flight created successfully",
                err: {}
            })
        } catch (error) {
            return res.status(error.statusCode).json({
                message: error.message,
                success: false,
                err: error.explanation,
                data: {}
            });
        }
    }
}
