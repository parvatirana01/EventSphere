import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import AuthService from '../services/authService'
import { User, LoginCredentials, RegisterData, UpdateUserData, SendOtpData, VerifyOtpData } from '../services/api/types'
import { classifyError } from '../utils/errorHandling';
import { isDevelopment } from '../config/environment';





interface AuthStore {
    
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isAuthChecking: boolean;
    isMutating: boolean;
    isOtpSending: boolean;
    isOtpVerifying: boolean;

    login: (credentials: LoginCredentials) => Promise<void>;
    registerUser: (userData: RegisterData) => Promise<void>;
    sendOtp: (userData: SendOtpData) => Promise<void>;
    verifyOtp: (userData: VerifyOtpData) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    updateProfile: (userData: UpdateUserData) => Promise<void>;
    setLoading: (Loading: boolean) => void;
    clearError: () => void;
    clearAuth: () => void;

}

export const useAuthStore = create<AuthStore>()(
    persist(
        devtools((set) => (
            {
                user: null,
                isAuthenticated: false,
                error: null,
                isLoading: false,
                isAuthChecking: false,
                isMutating: false,
                isOtpSending: false,
                isOtpVerifying: false,
                

                login: async (credentials) => {
                    set({
                        isLoading: true,
                        error: null
                    })
                    try {


                        const response = await AuthService.login(credentials);
                        if (response.success && response.data) {
                            set(
                                {
                                    user: response.data,
                                    isAuthenticated: true,
                                    isLoading: false,
                                    error: null
                                }
                            );
                            console.log("Login successful");
                        }
                        else {
                            throw new Error(response.message || "Login Failed");
                        }

                    } catch (error: any) {
                        const classifiedError = classifyError(error);
                        if (isDevelopment())
                            console.log("Login failed :", classifiedError);
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: classifiedError.message
                        })

                    }

                },
                registerUser: async (userData) => {
                    set({
                        isMutating: true,
                        error: null
                    });
                    try {


                        const response = await AuthService.register(userData);
                        if (response.success) {
                            set(
                                {
                                    isMutating: false,
                                    error: null
                                }
                            );
                            console.log("registration successful");
                        }
                        else throw new Error(response.message || "Registration failed")

                    } catch (error: any) {
                        console.log("Registration failed : ", error);
                        const classifiedError = classifyError(error);
                        set({
                            isMutating: false,
                            error: classifiedError.message
                        })



                        throw error
                    }
                },
                sendOtp: async (userData) => {
                    set({
                        isOtpSending: true,
                        error: null
                    })
                    
                    try {
                        const response = await AuthService.sendOtp(userData);
                        if (response.success) {
                            set({
                                isOtpSending: false,
                                error: null
                            })
                        }
                        else throw new Error(response.message || "OTP sending failed")
                    }
                    catch (error) {
                        const classifiedError = classifyError(error);
                        set({
                            isOtpSending: false,
                            error: classifiedError.message
                        })
                        throw error
                    }
                },
                verifyOtp: async (userData) => {
                    set({
                        isOtpVerifying: true,
                        error: null
                    })
                    
                    try {
                        const response = await AuthService.verifyOtp(userData);
                        if (response.success) {
                            set({
                                isOtpVerifying: false,
                                error: null
                            })
                        }
                        else throw new Error(response.message || "OTP verification failed")
                    }
                    catch (error) {
                        const classifiedError = classifyError(error);
                        set({
                            isOtpVerifying: false,
                            error: classifiedError.message
                        })
                        throw error
                    }
                },
                    logout: async () => {
                    set({
                        isLoading: true,
                    })
                    try {
                        const response = await AuthService.logout()
                        if (response.success) {
                            set({
                                user: null,
                                isAuthenticated: false,
                                isLoading: false,
                                error: null
                            });
                        }


                    } catch (error) {
                        console.error('⚠️ Logout API error (continuing with local logout):', error);
                        const classifiedError = classifyError(error);


                        if (classifiedError.type === 'network_error') {

                            set({
                                isLoading: false,
                                error: 'Logout failed due to network error. Please try again.',

                            });


                        } else if (classifiedError.type === 'authentication_error' || classifiedError.type === 'authorization_error') {

                            console.log('🔐 Auth error during logout - tokens likely expired');
                            set({
                                user: null,
                                isAuthenticated: false,
                                isLoading: false,
                                error: null
                            });

                        } else if (classifiedError.type === 'server_error') {

                            set({
                                isLoading: false,
                                error: 'Server error during logout. Please try again or contact support.',

                            });


                        } else {

                            set({
                                isLoading: false,
                                error: 'Logout failed. Please try again.',
                            });

                        }
                        throw error;
                    }
                },
                checkAuth: async () => {

                    set({
                        isAuthChecking: true
                    })
                    try {
                        const response = await AuthService.getCurrentUser();
                        if (response.success) {
                            set({
                                user: response.data,
                                isAuthenticated: true,
                                error: null,
                                isAuthChecking: false
                            })
                            console.log("Ath check successful");

                        }
                        else throw new Error("Authentication check failed")
                    } catch (error) {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isAuthChecking: false,
                            error: null,
                        });
                        throw error
                    }
                },
                refreshToken: async () => {

                    try {
                        console.log("Refreshing token ")
                        const response = await AuthService.refreshAccessToken()
                        if (response.success) {
                            set({
                                user: response.data,
                                isAuthenticated: true,
                                error: null
                            })
                            return true
                        }
                        else {
                            return false
                        }

                    } catch (error) {
                        console.log("Token refresh failed : ", error);
                        set({
                            user: null,
                            isAuthenticated: false,
                            error: null
                        })
                        return false
                    }
                },
                updateProfile: async (userData) => {
                    set({
                        isMutating: true, error: null
                    })
                    try {
                        const response = await AuthService.updateProfile(userData);
                        if (response.success) {
                            set({
                                user: response.data,
                                isAuthenticated: true,
                                isMutating: false,
                                error: null
                            })
                            console.log("Profile Update Successful");

                        }
                        else {
                            throw new Error(response.message || "Profile Update Failed")
                        }
                    } catch (error) {
                        const classifiedError = classifyError(error);
                        set({

                            isMutating: false,
                            error: classifiedError.message
                        })

                    }
                },

                clearAuth: async () => {
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: null,
                        isLoading: false
                    })
                },
                clearError: () => {
                    set({
                        error: null
                    })
                },
                setLoading: (Loading: boolean) => {
                    set({ isLoading: Loading })
                },
                setOtpSending: (isOtpSending: boolean) => {
                    set({ isOtpSending })
                },
                setOtpVerifying: (isOtpVerifying: boolean) => {
                    set({ isOtpVerifying })
                }
            }
        ), { name: 'Auth-Store' })
        ,
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
)