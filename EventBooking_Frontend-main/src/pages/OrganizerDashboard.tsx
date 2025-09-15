import React, { useEffect, useState, useCallback } from 'react';
import {
    Calendar,
    Users,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    Eye,
    BarChart3,
    
    
    
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Container from '../components/layout/Container';
import useEventStore from '../store/eventStore';

import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import websocketService from '../services/Websocket.service';
import { useSocketStore } from '../store/socketStore';





export const OrganizerDashboard: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const {isConnected} = useSocketStore()
    
    const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'analytics' | 'settings'>('overview');
    const { clearError, error, fetchMyEvents, myEvents, isLoading, deleteEvent, isMutating, pagination } = useEventStore();
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeEvents: 0,
        totalRegistrations: 0,
        thisMonth: 0,
        updatedAt: ''  
    })
    const [currentPage, setCurrentPage] = useState(1);

    const createQuery = useCallback(() => ({
        page: currentPage,
        limit: 10,
    }), [currentPage]);

    useEffect(() => {
        fetchMyEvents(createQuery());
    }, [fetchMyEvents, createQuery]);

    useEffect(() => {
        clearError()
    }, [clearError])

    useEffect(()=>{
        if(error){
            message.error(error)
            clearError()
        }
    },[error])

    useEffect(() => {
        const onStats = (s: any) => {
            console.log('Received organizer stats:', s);
            setStats(s); // replace with your state setter
          };
          const onWsConnect = () => {
            console.log('WS connected – requesting organizer stats');
            websocketService.emit('request_organizer_stats');
          };
        
          websocketService.on('organizer_stats_update', onStats);
          
        
          if (isConnected) onWsConnect();
        
          return () => {
            websocketService.off('organizer_stats_update',onStats);
          };
    }, [isConnected])



    const deleteHandler = (id: number) => async () => {
        console.log("inside");

        try {
            await deleteEvent(id);
            message.info("Event deleted successfully!")
        } catch (error) {

        }
    }
    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(pagination.myEvents.totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };


    return (
        <Container>
            <div className="py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Events Dashboard</h1>
                    <p className="text-neutral-600">Manage your events and track performance</p>
                </div>

                {stats.updatedAt && (
                    <div className="mb-6 text-sm text-gray-500 flex items-center space-x-2">
                        <span>🕒</span>
                        <span>Last Updated: {new Date(stats.updatedAt).toLocaleString()}</span>
                    </div>
                )}

                <div className="border-b border-neutral-200 mb-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'events', label: 'My Events', icon: Calendar },
                            
                            
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {}
                <div className="space-y-8">
                    {}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-600">Total Events</p>
                                            <p className="text-2xl font-bold text-neutral-900">{stats.totalEvents}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-primary-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-600">Active Events</p>
                                            <p className="text-2xl font-bold text-neutral-900">{stats.activeEvents}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-success-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-600">Total Registrations</p>
                                            <p className="text-2xl font-bold text-neutral-900">{stats.totalRegistrations}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-6 h-6 text-accent-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-600">This Month</p>
                                            <p className="text-2xl font-bold text-neutral-900">{stats.thisMonth}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-warning-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {}
                            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-neutral-900">Recent Events</h2>
                                    <Button variant="outline" size="sm" onClick={() => { setActiveTab("events") }}>
                                        View All
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {myEvents.slice(0, 4).map((event) => (
                                        <div
                                            key={event.id}
                                            className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-neutral-900">{event.title}</h3>
                                                {}
                                            </div>

                                            <div className="space-y-2 text-sm text-neutral-600 mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        {new Date(event.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Users className="w-4 h-4" />
                                                    <span>{event.registrations || 0} registrations</span>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    navigate(`/events/${event.id}`, {
                                                        state: {
                                                            from: location.pathname
                                                        }
                                                    })
                                                }}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    navigate(`/update-event/${event.id}`, {
                                                        state: {
                                                            from: location.pathname
                                                        }
                                                    });
                                                }}>
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {}
                    {activeTab === 'events' && (
                        <div className="space-y-6">
                            {}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                                <div>
                                    <h2 className="text-xl font-semibold text-neutral-900">My Events</h2>
                                    <p className="text-neutral-600">Manage and track your events</p>
                                </div>
                                <Button size="lg" onClick={() => { navigate("/create-event", { state: { from: location.pathname } }) }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create New Event
                                </Button>
                            </div>

                            {error && (
                                <div className="mb-4 rounded-md border border-error-200 bg-error-50 p-4 text-error-700">
                                    <div className="flex items-center justify-between">
                                        <span>{typeof error === 'string' ? error : 'Failed to load your events.'}</span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => fetchMyEvents({ page: currentPage })}
                                            >
                                                Retry
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={clearError}>
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isLoading ? (<>
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <LoadingSpinner size="lg" />
                                        <p className="mt-4 text-neutral-600">Loading events...</p>
                                    </div>
                                </div>
                            </>) : (<>
                                {myEvents.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No events found</h3>
                                        <p className="text-neutral-600 mb-4">

                                            Create your first event to get started!

                                        </p>

                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {myEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden"
                                            >
                                                <div className="relative h-48">
                                                    <div className="h-48 bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                                                        {event.images && !Array.isArray(event.images) ? (
                                                            <img
                                                                src={event.images}
                                                                alt={event.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Calendar className="w-12 h-12 text-primary-600" />
                                                        )}
                                                    </div>

                                                </div>

                                                <div className="p-6">
                                                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                                        {event.title}
                                                    </h3>

                                                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                                                        {event.description}
                                                    </p>

                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>
                                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                                                            <Users className="w-4 h-4" />
                                                            <span>{event.registrations || 0} registrations</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex space-x-2">
                                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                                                            navigate(`/events/${event.id}`, {
                                                                state: {
                                                                    from: location.pathname
                                                                }
                                                            })
                                                        }}>
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View Details
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                navigate(`/update-event/${event.id}`, {
                                                                    state: {
                                                                        from: location.pathname
                                                                    }
                                                                })
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm"
                                                            onClick={() => { deleteHandler(event.id)() }}
                                                            disabled={isMutating}
                                                            loading={isMutating}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pagination.myEvents.totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mt-6">
                                        <div className="text-sm text-neutral-700">
                                            Page {currentPage} of {pagination.myEvents.totalPages} • {pagination.myEvents.totalItems} total bookings
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1 || isLoading}
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Previous
                                            </Button>

                                            <div className="hidden sm:flex space-x-1">
                                                {getPageNumbers().map((pageNum) => (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pageNum === currentPage ? "primary" : "ghost"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNum)}
                                                        disabled={isLoading}
                                                        className="min-w-10"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                ))}
                                            </div>

                                            <div className="sm:hidden text-sm text-neutral-600">
                                                {currentPage} / {pagination.myEvents.totalPages}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === pagination.myEvents.totalPages || isLoading}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>)}

                        </div>
                    )}

                    {}
                    {activeTab === 'analytics' && (
                        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Analytics</h2>
                            <div className="text-center py-12">
                                <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-neutral-900 mb-2">Analytics Coming Soon</h3>
                                <p className="text-neutral-600">
                                    Detailed analytics and insights will be available here.
                                </p>
                            </div>
                        </div>
                    )}

                    {}
                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Organizer Settings</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Event Management</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-neutral-900">Auto-approve Registrations</p>
                                                <p className="text-sm text-neutral-600">Automatically approve new registrations</p>
                                            </div>
                                            <input type="checkbox" className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-neutral-900">Email Notifications</p>
                                                <p className="text-sm text-neutral-600">Get notified about new registrations</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Organization Profile</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Organization Name" placeholder="Enter organization name" />
                                        <Input label="Contact Email" type="email" placeholder="contact@organization.com" />
                                        <Input label="Phone Number" placeholder="+1 (555) 123-4567" />
                                        <Input label="Website" placeholder="https://organization.com" />
                                    </div>
                                    <div className="mt-4">
                                        <Button>Save Changes</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
}; 