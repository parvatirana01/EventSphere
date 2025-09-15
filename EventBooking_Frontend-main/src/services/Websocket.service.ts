import { io, Socket } from 'socket.io-client'
import apiClient from './api/client';

class WebSocketService {
    private socket: Socket | null = null;
    private isConnected = false;

   async connect() {
        if (this.socket?.connected) return;

   const resp = await apiClient.post("/auth/socket-token")
   const token = resp.data.data.token;

        this.socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
            auth: {token},
            transports: ['websocket', 'polling']
        });
        this.socket.on('connect', () => {
            console.log('Websocket connected');
            this.isConnected = true

        });
        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.isConnected = false;
        });
        this.socket.on('auth_error', (error) => {
            console.error('WebSocket authentication error:', error);
            this.isConnected = false;
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }
    on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string,callback:(data? :any)=>void) {
        this.socket?.off(event,callback);
    }

    emit(event: string, data?: any) {
        this.socket?.emit(event, data);
    }
    get connected() {
        return this.isConnected;
    }
}
export default new WebSocketService()