import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { BookingService, EventService, PaginationState, Registration, RegistrationQuery } from '../services/index'
import { classifyError } from '../utils/errorHandling';
import { createInitialPaginationState, updatePaginationFromMeta } from '../utils/storeHelpers'
interface bookingStore {
    userBookings: Registration[];
    currentEventBookings: Registration[];
    currentBooking: Registration | null;
    pagination: {
        userBookings: PaginationState;
        currentEventBookings: PaginationState
    };
    isLoading: boolean;
    isMutating: boolean;
    error: string | null;

    fetchUserBookings: (query?: RegistrationQuery) => Promise<void>;
    fetchEventBookings: (eventId: number, query?: RegistrationQuery) => Promise<void>;
    fetchBookingById: (id: number) => Promise<void>;
    cancelBooking: (id: number) => Promise<void>;

    clearError: () => void;
    clearBookings: () => void;
}
const useBookingStore = create<bookingStore>()(devtools((set) => ({
    userBookings: [],
    currentEventBookings: [],
    currentBooking: null,
    pagination: {
        userBookings: createInitialPaginationState(),
        currentEventBookings: createInitialPaginationState()
    },
    isLoading: false,
    isMutating: false,
    error: null,
    fetchUserBookings: async (query) => {
        set({
            isLoading: true,
            error: null
        })
        try {
            const response = await BookingService.getUserBookings(query);
            if (response.success) {
                set((state) => ({
                    ...state,
                    isLoading: false,
                    pagination: {
                        ...state.pagination,
                        userBookings: updatePaginationFromMeta(response.data.meta)
                    },
                    userBookings: response.data.registrations,
                    error: null
                }))
            }
            else throw new Error(response.message)
        } catch (error) {
            const classifiedError = classifyError(error)
            set({
                isLoading: false,
                error: classifiedError.message,
                userBookings: []
            })
            throw error
        }
    },
    fetchEventBookings: async (eventId, query) => {
        set({
            isLoading: true,
            error: null
        })
        try {
            const response = await EventService.getEventBookings(eventId, query);
            if (response.success) {
                set((state) => ({
                    ...state,
                    isLoading: false,
                    currentEventBookings: response.data.registrations,
                    pagination: {
                        ...state.pagination,
                        currentEventBookings: updatePaginationFromMeta(response.data.meta)
                    }
                }))
            }
            else throw new Error(response.message)

        } catch (error) {
            const classifiedError = classifyError(error)
            set((state) => ({
                ...state,
                isLoading: false,
                error: classifiedError.message,
                pagination: {
                    ...state.pagination,
                    currentEventBookings: createInitialPaginationState()
                }
            }))
            throw error
        }
    },
    fetchBookingById: async (id) => {
        set({
            isLoading: true,
            error: null
        })
        try {
            const response = await BookingService.getBookingById(id);
            if (response.success) {
                set((state) => ({
                    ...state,
                    isLoading: false,
                    error: null,
                    currentBooking: response.data
                }))
            }
            else throw new Error(response.message)
        } catch (error) {
            const classifiedError = classifyError(error)
            set((state) => ({
                ...state,
                isLoading: false,
                error: classifiedError.message,
                currentBooking: null
            }))
            throw error
        }

    },
    cancelBooking: async (id) => {
        set({
            isMutating: true,
            error: null
        })
        try {
            const response = await BookingService.cancelBooking(id);
            if (response.success) {
                set((state) => ({
                    ...state,
                    isMutating: false,
                    error: null,
                    userBookings: state.userBookings.filter((booking) => (booking.id !== id)),
                    currentEventBookings: state.currentEventBookings.filter((booking) => (booking.id !== id)),
                    currentBooking: state.currentBooking?.id === id ? null : state.currentBooking
                }))
            }
            else throw new Error(response.message)
        } catch (error) {
            const classifiedError = classifyError(error)
            set((state) => ({
                ...state,
                isMutating: false,
                error: classifiedError.message,
            }))
            throw error
        }
    },
    clearBookings: () => {
        set({
            currentEventBookings: [],
            currentBooking: null,
            userBookings: []
        })
    },
    clearError: () => {
        set({
            error: null
        })
    }


}), { name: 'Booking-Store' })
)

export default useBookingStore