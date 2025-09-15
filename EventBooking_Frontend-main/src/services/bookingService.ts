import { get, del } from './api/client';
import {
    Registration,
    RegistrationQuery,
    ApiResponse,
    RegistrationsResponse
} from './api/types';

class BookingService {
    static async getBookingById(id: number): Promise<ApiResponse<Registration>> {
        const response = await get<Registration>(`/bookings/${id}`);
        return response.data;
    }
    static async getUserBookings(query?: RegistrationQuery): Promise<ApiResponse<RegistrationsResponse>> {
        const response = await get<RegistrationsResponse>('/bookings/get/my-bookings', { params: query });
        return response.data;
    }
    static async cancelBooking(id: number): Promise<ApiResponse<null>> {
        const response = await del<null>(`/bookings/${id}`);
        return response.data;
    }

}

export default BookingService