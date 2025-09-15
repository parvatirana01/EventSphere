import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import LoadingSpinner from '../ui/LoadingSpinner'

type userRole = 'USER' | 'ORGANIZER' | 'ADMIN'
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole ?: userRole | userRole[];
    requiredAuth?: boolean
}
export const ProtectedRoute = ({ children, requiredRole, requiredAuth = true }: ProtectedRouteProps) => {
    const location = useLocation()
    const { user, isAuthenticated, isLoading } = useAuthStore();
    console.log('🔒 ProtectedRoute Check:', {
        path: location.pathname,
        isAuthenticated,
        userRole: user?.role,
        requiredRole,
        isLoading
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (requiredAuth && !isAuthenticated) {
        return <Navigate to='/login' state={{ from: location.pathname }} replace />
    }

    if (requiredRole && user) {
        const hasRequiredRole = Array.isArray(requiredRole) ? requiredRole.includes(user.role) : requiredRole === user.role
        if (!hasRequiredRole) {
            console.log(" Dont have required role ");
            <Navigate to='/unauthorized' replace />
        }
    }
    console.log('Access granted')

    return <>{children}</>


}

