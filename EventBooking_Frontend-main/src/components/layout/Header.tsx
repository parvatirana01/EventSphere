import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import {
    User,
    LogOut,
    Calendar,
    ChevronDown,
    Menu,
    X,
    GaugeCircle
} from 'lucide-react';
import { message } from 'antd';


const Header: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    
    const handleLogout = async () => {
        try {
            await logout();
            message.success('Logged out successfully');
            navigate('/', { replace: true });
            setIsProfileOpen(false);
        } catch (error) {
            message.error('Logout failed. Please try again.');
        }
    };


    const getRoleBasedNavItems = () => {
        const baseItems = [
            { label: 'Home', href: '/' },
            { label: 'Events', href: '/events' },
        ];


        if (!isAuthenticated) {
            return baseItems;
        }

        
        const authenticatedItems = [
            ...baseItems,
            { label: 'Dashboard', href: '/dashboard' },
        ];



        if (user?.role === 'ADMIN') {
            authenticatedItems.push({ label: 'Create Event', href: '/create-event' });
        }

        return authenticatedItems;
    };

    const navItems = getRoleBasedNavItems();


    const profileItems = [
        
        ...(user?.role === 'USER' ? [{
            label: 'Become Organizer',
            href: '/organizer-request',
            icon: Calendar
        }] : []),
        ...(user?.role === 'ORGANIZER' ? [{
            label: 'Events Dashboard',
            href: '/organizer/dashboard',
            icon: Calendar
        }] : []),
        ...(user?.role === 'ADMIN' ? [{
            label: 'Events Dashboard',
            href: '/organizer/dashboard',
            icon: Calendar
        },
        {
            label: 'Admin Panel',
            href: '/admin',
            icon: GaugeCircle
         }] : []),
    ];

    return (
        <header className="w-full bg-white shadow-soft sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {}
                    <Link
                        to="/"
                        className="text-2xl font-heading font-bold text-primary-600 tracking-tight hover:text-primary-700 transition-colors"
                    >
                        EventSphere
                    </Link>

                    {}
                    <nav className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className="text-base font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}

                        {}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                        {user?.profileImage ? (
                                            <img
                                                src={user.profileImage}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-4 h-4 text-primary-600" />
                                        )}
                                    </div>
                                    <span className="font-medium">{user?.name}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-50">
                                        {}
                                        <div className="px-4 py-2 border-b border-neutral-200">
                                            <p className="font-medium text-neutral-900">{user?.name}</p>
                                            <p className="text-sm text-neutral-600">{user?.email}</p>
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1",
                                                user?.role === 'ADMIN' && "bg-red-100 text-red-800",
                                                user?.role === 'ORGANIZER' && "bg-blue-100 text-blue-800",
                                                user?.role === 'USER' && "bg-green-100 text-green-800"
                                            )}>
                                                {user?.role}
                                            </span>
                                        </div>

                                        {}
                                        {profileItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                to={item.href}
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors"
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        ))}

                                        {}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Button
                                    onClick={() => navigate('/login', { state: { from: location.pathname } })}
                                    variant="ghost"
                                    size="sm"
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={() => navigate('/register')}
                                    variant="primary"
                                    size="sm"
                                >
                                    Register
                                </Button>
                            </div>
                        )}
                    </nav>


                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-neutral-700 hover:text-primary-600"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>


                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-neutral-200 py-4">
                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-base font-medium text-neutral-700 hover:text-primary-600 transition-colors py-2"
                                >
                                    {item.label}
                                </Link>
                            ))}


                            {isAuthenticated ? (
                                <div className="border-t border-neutral-200 pt-4 mt-4">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            {user?.profileImage ? (
                                                <img
                                                    src={user.profileImage}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-primary-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">{user?.name}</p>
                                            <p className="text-sm text-neutral-600">{user?.role}</p>
                                        </div>
                                    </div>

                                    {profileItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center space-x-2 py-2 text-neutral-700 hover:text-primary-600 transition-colors"
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center space-x-2 py-2 text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                
                                <div className="border-t border-neutral-200 pt-4 mt-4 space-y-3">
                                    <Button
                                        onClick={() => {
                                            navigate('/login');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-center"
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            navigate('/register');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        variant="primary"
                                        size="sm"
                                        className="w-full justify-center"
                                    >
                                        Register
                                    </Button>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;