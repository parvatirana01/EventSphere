
import { get, del } from './api/client';

export interface UserQuery {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: 'name' | 'email' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
    users: any[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

class UserService {
    static async getUsers(query?: UserQuery): Promise<any> {
        const response = await get<UsersResponse>('/users', { params: query });
        return response.data;
    }

    static async deleteUser(userId: number): Promise<any> {
        const response = await del(`/users/${userId}`);
        return response.data;
    }
}

export default UserService;