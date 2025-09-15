
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Users,
    Search,
    Trash2,
    Eye,
    Clock,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Input from '../components/ui/Input';
import useEventStore from '../store/eventStore';
import { message } from 'antd';

const AdminManageEventsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
    const [sortBy, setSortBy] = useState<'date' | 'title' | 'createdAt'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const {
        allEvents,
        pagination,
        isLoading,
        isMutating,
        error,
        fetchEvents,
        deleteEvent,
        clearError
    } = useEventStore();
     


    useEffect(() => {
        if (error) {
            message.error(error);
            clearError()
        }
    }, [error]);

    const createQuery = useCallback(() => {
        const now = new Date();
        let startDate, endDate;

        if (statusFilter === 'UPCOMING') {
            startDate = now.toISOString();
        } else if (statusFilter === 'PAST') {
            endDate = now.toISOString();
        }

        return {
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
            startDate,
            endDate,
            sortBy,
            sortOrder
        };
    }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

    
    useEffect(() => {
        fetchEvents(createQuery());
    }, [fetchEvents, createQuery]);

    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sortBy, sortOrder]);

    const handleDeleteEvent = useCallback(async (eventId: number) => {
        try {
            await deleteEvent(eventId);
            message.success('Event deleted successfully');
        } catch (error) {
            message.error('Failed to delete event');
        }
    }, [deleteEvent]);

    
    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.allEvents.totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pagination.allEvents.totalPages]);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, pagination.allEvents.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(pagination.allEvents.totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const getEventStatus = (eventDate: string) => {
        const now = new Date();
        const eventDateObj = new Date(eventDate);

        if (eventDateObj < now) {
            return { status: 'PAST', icon: <CheckCircle className="w-4 h-4 text-success-600" />, color: 'text-success-600' };
        } else {
            return { status: 'UPCOMING', icon: <Clock className="w-4 h-4 text-warning-600" />, color: 'text-warning-600' };
        }
    };

    if (isLoading && allEvents.length === 0) {
        return (
            <Container>
                <div className="py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-neutral-600">Loading events...</p>
                        </div>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-8">
                {}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/admin')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Manage Events</h1>
                    <p className="text-neutral-600">View and manage all platform events</p>
                </div>

                {}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Input
                                label="Search Events"
                                placeholder="Search by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-4 h-4 absolute right-3 top-8 text-neutral-400" />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as any);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="ALL">All Events</option>
                                <option value="UPCOMING">Upcoming</option>
                                <option value="PAST">Past</option>
                            </select>
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field as any);
                                    setSortOrder(order as any);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="date-asc">Date (Earliest First)</option>
                                <option value="date-desc">Date (Latest First)</option>
                                <option value="title-asc">Title A-Z</option>
                                <option value="title-desc">Title Z-A</option>
                                <option value="createdAt-desc">Newest Created</option>
                                <option value="createdAt-asc">Oldest Created</option>
                            </select>
                        </div>
                    </div>
                </div>

                

                {}
                <div className="space-y-4">
                    {allEvents.map((event) => {
                        const eventStatus = getEventStatus(event.date);
                        return (
                            <div
                                key={event.id}
                                className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {event.images && !Array.isArray(event.images) ? (
                                                    <img
                                                        src={event.images}
                                                        alt={event.title}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <Calendar className="w-8 h-8 text-primary-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-neutral-900 truncate">
                                                        {event.title}
                                                    </h3>
                                                    <span className={`flex items-center space-x-1 text-sm font-medium ${eventStatus.color} flex-shrink-0`}>
                                                        {eventStatus.icon}
                                                        <span>{eventStatus.status}</span>
                                                    </span>
                                                </div>
                                                <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                                                    {event.description}
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm text-neutral-600">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="w-4 h-4 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {new Date(event.date).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                                        <span className="truncate">{event.city}, {event.state}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4 flex-shrink-0" />
                                                        <span>{event.registrations || 0} registrations</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-4 flex-shrink-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => navigate(`/events/${event.id}`, {
                                                state: { from: location.pathname }
                                            })}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleDeleteEvent(event.id)}
                                            disabled={isMutating}
                                            loading={isMutating}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {}
                {allEvents.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No events found</h3>
                        <p className="text-neutral-600">
                            {searchTerm || statusFilter !== 'ALL'
                                ? 'Try adjusting your search or filters.'
                                : 'There are no events created yet.'
                            }
                        </p>
                    </div>
                )}

                {}
                {pagination.allEvents.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mt-6">
                        {}
                        <div className="text-sm text-neutral-700">
                            Page {pagination.allEvents.currentPage} of {pagination.allEvents.totalPages} • {pagination.allEvents.totalItems} total events
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.allEvents.currentPage - 1)}
                                disabled={pagination.allEvents.currentPage === 1 || isLoading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>

                            <div className="hidden sm:flex space-x-1">
                                {getPageNumbers().map((pageNum) => (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === pagination.allEvents.currentPage ? "primary" : "ghost"}
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
                                {pagination.allEvents.currentPage} / {pagination.allEvents.totalPages}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.allEvents.currentPage + 1)}
                                disabled={pagination.allEvents.currentPage === pagination.allEvents.totalPages || isLoading}
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default AdminManageEventsPage;