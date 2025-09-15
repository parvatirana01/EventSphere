import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { CreateOrganizerRequestData, OrganizerRequest, OrganizerRequestQuery, OrganizerRequestService, PaginationState, UpdateRequestStatusData } from '../services'
import { createInitialPaginationState, updatePaginationFromMeta } from '../utils/storeHelpers';
import { classifyError } from '../utils/errorHandling';
import { isDevelopment } from '../config/environment';

interface OrganizerRequestStore {
    allRequests: OrganizerRequest[];
    currentRequest: OrganizerRequest | null;

    pagination: PaginationState;

    isLoading: boolean;
    isMutating: boolean;
    error: string | null;

    fetchAllRequests: (query?: OrganizerRequestQuery) => Promise<void>;
    fetchRequestById: (id: number) => Promise<void>;
    updateRequestStatus: (id: number, status: UpdateRequestStatusData) => Promise<void>;

    createRequest: (requestData: CreateOrganizerRequestData) => Promise<void>

    clearError: () => void;
    clearRequests: () => void;
}

const useOrganizerRequestStore = create<OrganizerRequestStore>()(devtools((set,get) => ({
    allRequests: [],
    currentRequest: null,
    pagination: createInitialPaginationState(),
    isLoading: false,
    isMutating: false,
    error: null,

    fetchAllRequests: async (query) => {
        set({
            isLoading: true,
            error: null
        })
        try {
            const response = await OrganizerRequestService.getRequests(query);
            if (response.success) {
                set({
                    isLoading: false,
                    error: null,
                    allRequests: response.data.requests,
                    pagination: updatePaginationFromMeta(response.data.meta)
                })
                if (isDevelopment()) console.log("Requests fetched successfuly");

            }
            else throw new Error(response.message)
        } catch (error) {
            const classifiedError = classifyError(error);
            if (isDevelopment()) console.log(classifiedError);
            set({
                isLoading: false,
                error: classifiedError.message
            })
        }
    },
    fetchRequestById: async (id) => {
        set({
            isLoading: true,
            error: null
        })
        try {
            const response = await OrganizerRequestService.getRequestById(id)
            if (response.success) {
                set({
                    isLoading: false,
                    error: null,
                    currentRequest: response.data
                })
                if (isDevelopment()) console.log(" current Request fetched successfuly");

            }
            else throw new Error(response.message)
        } catch (error) {
            const classifiedError = classifyError(error);
            if (isDevelopment()) console.log(classifiedError);
            set({
                isLoading: false,
                error: classifiedError.message,
                currentRequest: null,

            })
        }
    },
    updateRequestStatus: async (id, status) => {
        set({
            isMutating: true,
            error: null
        })
        try {
            const response = await OrganizerRequestService.updateRequestStatus(id, status)
            if (response.success) {
                set((state) => ({
                    ...state,
                    isMutating: false,
                    error: null,
                    currentRequest: response.data.updatedRequest,
                    allRequests: state.allRequests.map((request) => {
                        if (request.id === id) {
                            request.status = status.status
                        }
                        return request
                    }),


                }))
                if (isDevelopment()) console.log("Request updated successfuly");

            }
            else throw new Error(response.message)
        } catch (error) {
            const classifiedError = classifyError(error);
            if (isDevelopment()) console.log(classifiedError);
            set({
                isMutating: false,
                error: classifiedError.message
            })
        }
    },
    createRequest: async (requestData) => {
        set({
            isMutating: true,
            error: null
        })
        try {
            const response = await OrganizerRequestService.createRequest(requestData)
            if (response.success) {
                set((state) => ({
                    ...state,
                    isMutating: false,
                    error: null,
                }))
                if (isDevelopment()) console.log("Request created successfuly");

            }
            else throw new Error(response.message)
        } catch (error) {
            const classifiedError = classifyError(error);
            if (isDevelopment()) console.log(classifiedError);
            set({
                isMutating: false,
                error: classifiedError.message
            })
            
            throw error
        }
    },
    clearError: () => {
        set({ error: null })
    },
    clearRequests: () => {
        set({
            allRequests: [],
            currentRequest: null,
            pagination: createInitialPaginationState()
        })
    }

}), {
    name: 'OrganizerRequest-Store'
}))

export default useOrganizerRequestStore