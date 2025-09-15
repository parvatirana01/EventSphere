import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
const HomePage: React.FC = () => {
    const{isAuthenticated,user} = useAuthStore()
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            {}
            <div className="text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-heading font-bold text-neutral-800">
                    Discover Amazing Events
                </h1>
                <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                    Find and book the best events in your area. From concerts to workshops,
                    we've got everything you need to make memories.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        className="text-lg px-8"
                        onClick={() => navigate('/events')}
                    >
                        Browse Events
                    </Button>
                    {
                        isAuthenticated && (user?.role==='ADMIN' || user?.role==='ORGANIZER') && (<Button
                            variant="outline"
                            size="lg"
                            className="text-lg px-8"
                            onClick={() => navigate('/create-event')}
                        >
                            Create Event
                        </Button>)
                    }
                </div>
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="w-8 h-8 text-accent-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800">Easy Booking</h3>
                    <p className="text-neutral-600">
                        Book events with just a few clicks. No complicated forms or hidden fees.
                    </p>
                </div>

                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                        <MapPin className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800">Local Events</h3>
                    <p className="text-neutral-600">
                        Discover events happening right in your neighborhood and nearby cities.
                    </p>
                </div>

                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                        <Users className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800">Community</h3>
                    <p className="text-neutral-600">
                        Connect with like-minded people and build lasting relationships.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;