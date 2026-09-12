import { StatusCodes } from "http-status-codes";
import BookingService from "../services/bookingService.js";

const bookingService = new BookingService();

export const create = async (req, res) => {
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