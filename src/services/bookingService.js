import axios from "axios";
import BookingRepository from "../repositories/bookingRepository.js";
import { FLIGHT_SERVICE_URL } from "../config/envConfig.js";
import ServiceError from "../utils/errors/service-error.js";

class BookingService {
    constructor() {
        this.bookingRepository = new BookingRepository()
    }
    async createBooking(data) {
        try {
            const flightId = data.flightId;
            const getFlightURL = `${FLIGHT_SERVICE_URL}/api/v1/flights/${flightId}`
            const response = await axios.get(getFlightURL);
            const flightData = response.data.data;
            let priceOfTheFlight = flightData.price;
            if(data.noOfSeats > flightData.totalSeats) {
                throw new ServiceError("Something went wrong in the booking process",
                    "Insufficient seats in the flight"
                )
            }
            const totalCost = priceOfTheFlight * data.noOfSeats;
            const bookingPayload = {...data, totalCost};
            const booking = await this.bookingRepository.create(bookingPayload);
            const updateFlightURL = `${FLIGHT_SERVICE_URL}/api/v1/flights/${booking.flightId}`;
            await axios.patch(updateFlightURL, {totalSeats: flightData.totalSeats - booking.noOfSeats});
            const finalBooking = await this.bookingRepository.update(booking.id, {status: "BOOKED"});
            return finalBooking;
        } catch (error) {
            console.log(error);
            throw new ServiceError();
        }
    }
}
export default BookingService;