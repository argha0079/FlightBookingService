import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/dbConfig.js";
import PrismaError from "../utils/errors/prisma-error.js";
import AppError from "../utils/errors/app-error.js"

class BookingRepository {
    async create(data) {
        try {
            const booking = await prisma.booking.create({
                data
            });
            return booking;
        } catch (error) {
            if (error.name.startsWith("Prisma")) {
                throw new PrismaError(error);
            }
            throw new AppError(
                "Repository Error",
                "Cannot create Booking",
                "There was some issue creating the booking, please try again later",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findById(id) {

    }

    findAll() {
        return prisma.booking.findMany({
            orderBy: { createdAt: "desc" }
        });
    }

    async update(id, data) {
        try {
            const booking = await prisma.booking.update({
                where: {
                    id
                },
                data
            });
            
            return booking;
        } catch (error) {
            throw new AppError('RepositoryError', 'Cannot update booking', 'There was some issue updating the booking, please try again later', StatusCodes.INTERNAL_SERVER_ERROR)
        }

    }

}

export default BookingRepository;