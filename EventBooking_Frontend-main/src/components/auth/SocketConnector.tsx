import { useEffect, ReactNode } from 'react';
import websocketService from '../../services/Websocket.service';
import { useAuthStore } from '../../store/authStore';
import { useSocketStore } from '../../store/socketStore';
interface SocketWrapperProps {
    children: ReactNode;
}

export default function SocketWrapper({ children }: SocketWrapperProps) {
    const { isAuthenticated, user } = useAuthStore();
    const { setConnected } = useSocketStore();

    useEffect(() => {
        let didUnmount = false;
      
        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);
      
        const attach = () => {
          websocketService.on('connect', onConnect);
          websocketService.on('disconnect', onDisconnect);
        };
        const detach = () => {
          websocketService.off('connect',onConnect);
          websocketService.off('disconnect',onDisconnect);
        };
      
        const run = async () => {
          if (isAuthenticated && user?.id) {
            console.log('🔌 Connecting to WebSocket...');
            await websocketService.connect(); 
            if (!didUnmount) attach();
          } else {
            detach();
            websocketService.disconnect();
            setConnected(false);
          }
        };
      
        run();
      
        return () => {
          didUnmount = true;
          detach();
          console.log('Disconnecting from WebSocket...');
          websocketService.disconnect();
        };
      }, [isAuthenticated, user?.id, setConnected]);

    return <>{children}</>;
}