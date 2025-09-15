export interface ApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    data: T;
    message: string;
}
export interface ApiError {
    success: false;
    statusCode: number;
    message: string;
    errors?: Record<string, string[]>;
}
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'USER' | 'ORGANIZER' | 'ADMIN';
    profileImage: string | null;
    createdAt?: string;
    updatedAt?: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    profileImage?: File;
}
export interface UpdateUserData {
    name?: string;
    password?: string;
}
export interface Event {
    id: number;
    title: string;
    description: string;
    date: string; 
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    longitude: number;
    latitude: number;
    images: string | string[] | null; 
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    distance?: number; 

    user?: {                 
        id: number;
        name: string;
        email?: string;
        profileImage?: string | null;
    };
    registrations?: number;
}

export interface CreateEventData {
    title: string;
    description: string;
    date: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    longitude: number;
    latitude: number;
    images?: File[];
}
export interface UpdateEventData {
    title?: string;
    description?: string;
    date?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    longitude?: number;
    latitude?: number;
    images?: File[];

}

export interface EventQuery {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'date' | 'title' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    skip: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface NearbyEventsQuery {
    latitude: number;
    longitude: number;
    radius?: number;
    unit?: 'km' | 'Mi';
    page?: number;
    limit?: number;
}
export interface EventsResponse {
    events: Event[];
    meta: PaginationMeta;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
export interface RegistrationsResponse {
    registrations: Registration[];
    meta: PaginationMeta;
}
export interface OrganizerRequestsResponse {
    requests: OrganizerRequest[];
    meta: PaginationMeta;
}

export interface Registration {
    id: number;
    userId: number;
    eventId: number;
    createdAt: string;
    
    user?: {
        id: number;
        name: string;
        email: string;
        profileImage?: string;
    };
    event?: Event;
}
export interface RegistrationQuery {
    page?: number;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
}
export interface OrganizerRequest {
    id: number;
    userId: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    overview: string | null;
    resume: string | null;
    createdAt: string;
    updatedAt: string;


    user?: {
        id: number;
        name: string;
        email: string;
        profileImage?: string;
    };
}
export interface UpdateRequestStatusResponse {
    updatedRequest: OrganizerRequest;
    updatedUser: User | null; 
}
export interface CreateOrganizerRequestData {
    overview: string;
    resume: File
}
export interface UpdateRequestStatusData {
    status: 'ACCEPTED' | 'REJECTED' | 'PENDING'
}
export interface OrganizerRequestQuery {
    page?: number;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
}
export interface FileUploadConfig {
    fieldName: string;
    allowedTypes?: string[];
    maxSize?: number;        
}


export interface RequestConfig {
    skipAuth?: boolean;
    timeout?: number;
    retries?: number;
}
export interface PaginationState {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrev: boolean
}

export interface SendOtpData{
    email:string
}
export interface VerifyOtpData{
    email:string
    otp:number
}
