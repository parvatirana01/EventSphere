import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';

const NotFoundPage: React.FC = () => {
    return (
        <Container>
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    {}
                    <div className="mb-6">
                        <h1 className="text-9xl font-bold text-gray-200">404</h1>
                    </div>

                    {}
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-100 p-4 rounded-full">
                            <Search className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>

                    {}
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Page Not Found
                    </h2>

                    {}
                    <p className="text-gray-600 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>

                    {}
                    <div className="space-y-3">
                        <Link to="/">
                            <Button className="w-full">
                                <Home className="h-4 w-4 mr-2" />
                                Go Home
                            </Button>
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 inline" />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default NotFoundPage;
