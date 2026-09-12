import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/dbConfig.js";
import PrismaError from "../utils/errors/prisma-error.js";

class BookingRepository {
    async create(data) {
        try {
            const booking = await prisma.booking.create(data);
            return booking;
        } catch (error) {
            if(error.name.startsWith("Prisma")) {
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

    update(id, data) {
        return prisma.booking.update({
            where: { id },
            data
        });
    }

    remove(id) {
        return prisma.booking.delete({
            where: { id }
        });
    }
}

export default BookingRepository;