import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import useOrganizerRequestStore from '../store/organizerRequestStore';
import { message } from 'antd';

type StatusFilter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

const AdminReviewRequestsPage: React.FC = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        allRequests,
        pagination,
        isLoading,
        isMutating,
        error,
        fetchAllRequests,
        updateRequestStatus,
        clearError
    } = useOrganizerRequestStore();

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, currentPage]);

    useEffect(() => {
        if (error) {
            message.error(error);
            clearError()
        }
    }, [error]);

    useEffect(() => {
        clearError();
    }, [clearError]);

    const fetchRequests = () => {
        const query = {
            page: currentPage,
            limit: 10,
            
            sortOrder: 'desc' as 'asc' | 'desc'
        };
        fetchAllRequests(query);
    };

    const handleStatusUpdate = async (requestId: number, newStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING') => {
        try {
            await updateRequestStatus(requestId, { status: newStatus });
            message.success(`Request ${newStatus.toLowerCase()} successfully`);
            fetchRequests(); 
        } catch (error) {
            message.error('Failed to update request status');
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(pagination.totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    
    const filteredRequests = statusFilter === 'ALL'
        ? allRequests
        : allRequests.filter(request => request.status === statusFilter);

    if (isLoading && allRequests.length === 0) {
        return (
            <Container>
                <div className="py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-neutral-600">Loading requests...</p>
                        </div>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-8">
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
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Review Organizer Requests</h1>
                    <p className="text-neutral-600">Manage and review organizer applications</p>
                </div>

                <div className="mb-6">
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-neutral-700">Filter by Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as StatusFilter);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="ALL">All Requests</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-md border border-error-200 bg-error-50 p-4 text-error-700">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={fetchRequests}
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

                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-neutral-900 truncate">
                                                {request.user?.name || 'Unknown User'}
                                            </h3>
                                            <p className="text-sm text-neutral-600 truncate">
                                                {request.user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    {request.overview && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-neutral-700 mb-2">Overview</h4>
                                            <p className="text-neutral-600 text-sm">{request.overview}</p>
                                        </div>
                                    )}

                                    {request.resume && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-neutral-700 mb-2">Resume</h4>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                                <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                                <a
                                                    href={request.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-600 hover:text-primary-700 underline cursor-pointer"
                                                >
                                                    View Resume
                                                </a>
                                                <span className="text-neutral-400 hidden sm:inline">•</span>
                                                <a
                                                    href={request.resume}
                                                    download
                                                    className="text-sm text-neutral-600 hover:text-neutral-700 underline cursor-pointer"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-4 text-sm text-neutral-500">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                            <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start lg:items-end gap-3 lg:gap-4">
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${request.status === 'PENDING' ? 'bg-warning-100 text-warning-700 border-warning-200' :
                                            request.status === 'ACCEPTED' ? 'bg-success-100 text-success-700 border-success-200' :
                                                'bg-error-100 text-error-700 border-error-200'
                                            }`}>
                                            {request.status === 'PENDING' ? <Clock className="w-4 h-4 text-warning-600" /> :
                                                request.status === 'ACCEPTED' ? <CheckCircle className="w-4 h-4 text-success-600" /> :
                                                    <XCircle className="w-4 h-4 text-error-600" />}
                                            <span className="ml-1">{request.status}</span>
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
                                        {request.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                                                    disabled={isMutating}
                                                    loading={isMutating}
                                                    className="w-full sm:w-auto"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                    disabled={isMutating}
                                                    loading={isMutating}
                                                    className="w-full sm:w-auto"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {request.status !== 'PENDING' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleStatusUpdate(request.id, 'PENDING')}
                                                disabled={isMutating}
                                                className="w-full sm:w-auto"
                                            >
                                                Reset to Pending
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRequests.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No requests found</h3>
                        <p className="text-neutral-600">
                            {statusFilter === 'ALL'
                                ? 'There are no organizer requests at the moment.'
                                : `There are no ${statusFilter.toLowerCase()} requests.`
                            }
                        </p>
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mt-6">
                        <div className="text-sm text-neutral-700">
                            Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalItems} total requests
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1 || isLoading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>

                            <div className="hidden sm:flex space-x-1">
                                {getPageNumbers().map((pageNum) => (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === pagination.currentPage ? "primary" : "ghost"}
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
                                {pagination.currentPage} / {pagination.totalPages}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages || isLoading}
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

export default AdminReviewRequestsPage;