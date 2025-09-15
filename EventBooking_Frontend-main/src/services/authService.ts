import { get, post, put } from './api/client'
import { LoginCredentials, RegisterData, UpdateUserData, ApiResponse, User, SendOtpData, VerifyOtpData } from './api/types'

class AuthService {
    static async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
        console.log("Started login inside service");

        const response = await post<User>("/auth/login", credentials);
        return response.data;
    }
    static async register(userData: RegisterData): Promise<ApiResponse<User>> {
        if (userData.profileImage) {
            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('email', userData.email);
            formData.append('password', userData.password);
            formData.append('profileImage', userData.profileImage);
            console.log(formData);

            const response = await post<User>("/auth/register", formData, {
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            });
            return response.data;
        }
        else {
            const { profileImage, ...formData } = userData;
            const response = await post<User>('/auth/register', formData);
            return response.data;
        }

    }
    static async sendOtp(userData: SendOtpData): Promise<ApiResponse<null>> {
        const response = await post<null>("/auth/send-otp", {},{ params: userData });
        return response.data;
    }
    static async verifyOtp(userData: VerifyOtpData): Promise<ApiResponse<null>> {
        const response = await post<null>("/auth/verify-otp", {}, { params: userData });
        return response.data;
    }
    static async updateProfile(userData: UpdateUserData): Promise<ApiResponse<User>> {
        const response = await put<User>("/auth/update", userData);
        return response.data
    }
    static async getCurrentUser(): Promise<ApiResponse<User>> {
        const response = await get<User>("/auth/me");
        return response.data;

    }
    static async logout(): Promise<ApiResponse<null>> {
        const response = await post<null>("/auth/logout");
        return response.data;
    }
    static async refreshAccessToken(): Promise<ApiResponse<User>> {
        const response = await post<User>("/auth/refresh-token");
        return response.data;
    }
}
export default AuthService;