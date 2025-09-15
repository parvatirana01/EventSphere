import { Event, EventQuery, PaginationState, NearbyEventsQuery, CreateEventData, UpdateEventData, EventService } from "../services/index"
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware'
import { createInitialPaginationState, updatePaginationFromMeta } from "../utils/storeHelpers";
import { classifyError } from "../utils/errorHandling";
import { isDevelopment } from "../config/environment";


interface EventStore {
    currentEvent: Event | null;
    allEvents: Event[];
    nearbyEvents: Event[];
    selectedFilters: EventQuery
    myEvents: Event[]
    pagination: {
        allEvents: PaginationState,
        nearbyEvents: PaginationState,
        myEvents: PaginationState
    };

    isLoading: boolean,
    isMutating: boolean,
    error: string | null

    fetchEvents: (query?: EventQuery) => Promise<void>
    fetchEventById: (id: number) => Promise<void>
    fetchNearbyEvents: (query: NearbyEventsQuery) => Promise<void>
    fetchMyEvents: (query?: EventQuery) => Promise<void>;

    createEvent: (eventData: CreateEventData) => Promise<Event>
    updateEvent: (id: number, eventData: UpdateEventData) => Promise<void>
    deleteEvent: (id: number) => Promise<void>

    bookEvent: (eventId: number) => Promise<void>

    clearError: () => void
    clearEvents: () => void


}

const useEventStore = create<EventStore>()(
    persist(
        devtools(
            (set) => ({
                currentEvent: null,
                myEvents: [],
                allEvents: [],
                nearbyEvents: [],
                pagination: {
                    myEvents: createInitialPaginationState(),
                    allEvents: createInitialPaginationState(),
                    nearbyEvents: createInitialPaginationState(),
                },
                selectedFilters: {},
                isLoading: false,
                isMutating: false,
                error: null,


                fetchEvents: async (query) => {
                    set({
                        isLoading: true,
                        error: null,
                        selectedFilters: query ? { ...query } : {}

                    })
                    try {

                        const response = await EventService.getEvents(query);
                        if (response.success) {

                            set((state) => ({
                                ...state,
                                allEvents: response.data.events,

                                pagination: {
                                    ...state.pagination,
                                    allEvents: updatePaginationFromMeta(response.data.meta)
                                },
                                isLoading: false
                            }))
                        }
                        else throw new Error(response.message || "Error while fetching the events")
                    } catch (error) {
                        const classifiedError = classifyError(error);
                        if (isDevelopment())
                            console.log(classifiedError);
                        set({
                            isLoading: false,
                            error: classifiedError.message
                        })
                        throw error;
                    }
                },
                fetchEventById: async (id) => {


                    set({ isLoading: true, error: null })
                    try {
                        const response = await EventService.getEventById(id);
                        if (response.success) {
                            set((state) => ({
                                ...state,
                                isLoading: false,
                                currentEvent: response.data

                            }))
                        }
                        else throw new Error(response.message)
                    } catch (error) {
                        const classifiedError = classifyError(error);

                        if (isDevelopment())
                            console.log(classifiedError);
                        set({
                            isLoading: false,
                            error: classifiedError.message,
                            currentEvent: null
                        })
                        throw error;
                    }
                },
                fetchNearbyEvents: async (query) => {
                    set({
                        isLoading: true,
                        error: null
                    })
                    try {
                        const response = await EventService.getNearbyEvents(query);
                        if (response.success) {

                            set((state) => ({
                                ...state,
                                isLoading: false,
                                error: null,
                                nearbyEvents: response.data.events,
                                pagination: {
                                    ...state.pagination,
                                    nearbyEvents: updatePaginationFromMeta(response.data.meta)
                                }

                            }))
                        }
                        else throw new Error(response.message)

                    } catch (error) {
                        const classifiedError = classifyError(error);
                        if (isDevelopment())
                            console.log(classifiedError);
                        set({
                            isLoading: false,
                            error: classifiedError.message
                        })
                        throw error;
                    }


                },
                fetchMyEvents: async (query) => {
                    set({
                        isLoading: true,
                        error: null
                    })
                    try {
                        const response = await EventService.getMyEvents(query);
                        if (response.success) {
                            set((state) => ({
                                ...state,
                                isLoading: false,
                                error: null,
                                myEvents: response.data.events,
                                pagination: {
                                    ...state.pagination,
                                    myEvents: updatePaginationFromMeta(response.data.meta)
                                }
                            }))
                        }
                        else throw new Error(response.message)
                    } catch (error) {
                        const classifiedError = classifyError(error);
                        if (isDevelopment())
                            console.log(classifiedError);
                        set({
                            isLoading: false,
                            error: classifiedError.message
                        })
                        throw error;
                    }
                },
                createEvent: async (eventData) => {
                    set({
                        isMutating: true,
                        error: null
                    });
                    try {
                        const response = await EventService.createEvent(eventData);
                        if (response.success) {
                            set((state) => ({
                                ...state,
                                isMutating: false,
                                error: null,
                                myEvents: [],
                                allEvents: [],
                                pagination: {
                                    allEvents: createInitialPaginationState(),
                                    nearbyEvents: createInitialPaginationState(),
                                    myEvents: createInitialPaginationState()
                                }

                            }))
                            return response.data
                        }
                        else throw new Error(response.message)
                    } catch (error) {
                        const classifiedError = classifyError(error);
                        if (isDevelopment())
                            console.log(classifiedError);
                        set({
                            isMutating: false,
                            error: classifiedError.message
                        })
                        throw error;
                    }
                },
                updateEvent: async (id, eventData) => {
                    set({
                        isMutating: true,
                        error: null
                    });
                    try {
                        const response = await EventService.updateEvent(id, eventData);
                        if (response.success) {
                            set((state) => ({
                                ...state,
                                isMutating: false,
                                error: null,
                                myEvents: [],
                                allEvents: [],
                                pagination: {
                                    allEvents: createInitialPaginationState(),
                                    nearbyEvents: createInitialPaginationState(),
                                    myEvents: createInitialPaginationState()
                                }


                            }))
                            return response.data
                        }
                        else throw new Error(response.message)
                    } catch (error) {
                        const classifiedError = classifyError(error);
                        if (isDevelopment())
                            console.log(classifiedError);
                        set({
                            isMutating: false,
                            error: classifiedError.message
                        })
                        throw error;
                    }
                },
                deleteEvent: async (id) => {
                    set({
                        isMutating: true,
                        error: null
                    });
                    try {
                        const response = await EventService.deleteEvent(id);
                        if (response.success) {

                            set((state) => ({
                                ...state,
                                allEvents: state.allEvents.filter((event) => (event.id !== id)),
                                nearbyEvents: state.nearbyEvents.filter((event) => (event.id !== id)),
                                myEvents: state.myEvents.filter((event) => (event.id !== id)),

                                isMutating: false
                            }))
                        }
                        else throw new Error(response.message)
                    } catch (error) {
                        const classifiedError = classifyError(error)
                        if (isDevelopment())
                            console.log(classifiedError);

                        set({
                            isMutating: false,
                            error: classifiedError.message
                        })
                        throw error
                    }
                },

                bookEvent: async (eventId) => {
                    set({ isMutating: true, error: null })

                    try {
                        const response = await EventService.bookEvent(eventId)

                        if (response.success) {

                            set({ isMutating: false })
                        } else {
                            throw new Error(response.message)
                        }
                    } catch (error: any) {
                        const classifiedError = classifyError(error)
                        if (isDevelopment())
                            console.log(classifiedError);
                        set({
                            isMutating: false,
                            error: classifiedError.message
                        })
                        throw error
                    }
                },

                clearError: () => { set({ error: null }) },
                clearEvents: () => {
                    set({

                        allEvents: [],
                        nearbyEvents: [],
                        selectedFilters: {},
                        myEvents: [],
                        pagination: {
                            myEvents: createInitialPaginationState(),
                            allEvents: createInitialPaginationState(),
                            nearbyEvents: createInitialPaginationState()
                        }
                    })
                },




            }), { name: 'event-store' }
        ), {
        name: 'event-storage',
        partialize: (state) => ({

            selectedFilters: state.selectedFilters
        })
    }
    )
)

export default useEventStore