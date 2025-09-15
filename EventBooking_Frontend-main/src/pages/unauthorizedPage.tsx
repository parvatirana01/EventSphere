import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import { useAuthStore } from '../store/authStore';

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();

    const handleGoBack = () => {
        navigate(-1); 
    };

    const getRedirectPath = () => {
        if (!isAuthenticated) return '/login';

        
        switch (user?.role) {
            case 'ADMIN':
                return '/admin';
            case 'ORGANIZER':
                return '/organizer';
            case 'USER':
                return '/dashboard';
            default:
                return '/';
        }
    };

    return (
        <Container>
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    {}
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-100 p-4 rounded-full">
                            <Shield className="h-12 w-12 text-red-600" />
                        </div>
                    </div>

                    {}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Access Denied
                    </h1>

                    {}
                    <p className="text-gray-600 mb-2">
                        You don't have permission to access this page.
                    </p>

                    {isAuthenticated && user ? (
                        <p className="text-sm text-gray-500 mb-8">
                            Your current role: <span className="font-semibold text-blue-600">{user.role}</span>
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 mb-8">
                            Please log in to continue.
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {isAuthenticated ? (
                            <>
                                <Link to={getRedirectPath()}>
                                    <Button className="w-full">
                                        <Home className="h-4 w-4 mr-2" />
                                        Go to My Dashboard
                                    </Button>
                                </Link>

                                <button
                                    onClick={handleGoBack}
                                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2 inline" />
                                    Go Back
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button className="w-full">
                                        Sign In
                                    </Button>
                                </Link>

                                <Link to="/">
                                    <Button variant="outline" className="w-full">
                                        <Home className="h-4 w-4 mr-2" />
                                        Go Home
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">
                            If you believe this is an error, please contact your administrator.
                        </p>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default UnauthorizedPage;
