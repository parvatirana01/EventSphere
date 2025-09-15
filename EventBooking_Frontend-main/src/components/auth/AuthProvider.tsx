import React, {useEffect,useState ,useRef} from "react"
import { useAuthStore } from "../../store/authStore"
import LoadingSpinner from "../ui/LoadingSpinner"

interface AuthProviderProps {
    children : React.ReactNode
}

export const AuthProvider  = ({children} : AuthProviderProps)=>{
    const {checkAuth,isAuthChecking, clearAuth} = useAuthStore();
    const [isInitializing,setIsInitializing] = useState(true)
    const hasInitialized = useRef(false);
    useEffect(()=>{
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        (async () => {
            
            try {
                await checkAuth()
               
            } catch (error) {
                clearAuth()
            }
            finally{
                setIsInitializing(false)
            }
        })()
    },[])
      
      if (isInitializing || isAuthChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-lg text-neutral-600">
                        Checking authentication...
                    </p>
                </div>
            </div>
        );
    }
    return<>{children}</>
}