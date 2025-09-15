
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import UserService, { UserQuery } from '../services/userService';
import { createInitialPaginationState, updatePaginationFromMeta } from '../utils/storeHelpers';
import { classifyError } from '../utils/errorHandling';
import { isDevelopment } from '../config/environment';

interface UserStore {
    users: any[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    isLoading: boolean;
    error: string | null;
    isDeleting: boolean;

    fetchUsers: (query?: UserQuery) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
    clearError: () => void;
    clearUsers: () => void;
}

const useUserStore = create<UserStore>()(
    devtools((set) => ({
        users: [],
        pagination: createInitialPaginationState(),
        isLoading: false,
        error: null,
        isDeleting: false,

        fetchUsers: async (query) => {
            set({
                isLoading: true,
                error: null
            });

            try {
                const response = await UserService.getUsers(query);
                if (response.success) {
                    set({
                        isLoading: false,
                        error: null,
                        users: response.data.users,
                        pagination: updatePaginationFromMeta(response.data.meta)
                    });
                    if (isDevelopment()) console.log("Users fetched successfully");
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                const classifiedError = classifyError(error);
                if (isDevelopment()) console.log(classifiedError);
                set({
                    isLoading: false,
                    error: classifiedError.message
                });
            }
        },

        deleteUser: async (userId: number) => {
            set({ isDeleting: true, error: null });

            try {
                const response = await UserService.deleteUser(userId);
                if (response.success) {
                    set((state) => ({
                        users: state.users.filter(user => user.id !== userId),
                        isDeleting: false,
                        error: null
                    }));
                    if (isDevelopment()) console.log("User deleted successfully");
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                const classifiedError = classifyError(error);
                if (isDevelopment()) console.log(classifiedError);
                set({
                    isDeleting: false,
                    error: classifiedError.message
                });
                throw error; 
            }
        },

        clearError: () => set({ error: null }),
        clearUsers: () => set({ users: [] })
    }))
);

export default useUserStore;