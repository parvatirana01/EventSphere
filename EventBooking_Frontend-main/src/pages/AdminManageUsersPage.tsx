
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    User,
    Mail,
    Calendar,
    Shield,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Input from '../components/ui/Input';
import useUserStore from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { message } from 'antd';

const AdminManageUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const {
        users,
        pagination,
        isLoading,
        error,
        isDeleting,
        fetchUsers,
        deleteUser,
        clearError
    } = useUserStore();

    const { user: currentUser, } = useAuthStore();

    useEffect(() => {
        clearError();
    }, [clearError]);


    useEffect(() => {
        if (error) {
            message.error(error);
            clearError()
        }
    }, [error]);

    const createQuery = useCallback(() => ({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        sortBy,
        sortOrder
    }), [currentPage, searchTerm, roleFilter, sortBy, sortOrder]);


    useEffect(() => {
        fetchUsers(createQuery());
    }, [fetchUsers, createQuery]);


    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentPage(1);
        }, 500)

        return () => clearTimeout(timeout);
    }, [searchTerm, roleFilter, sortBy, sortOrder]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pagination.totalPages]);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(pagination.totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Shield className="w-4 h-4 text-error-600" />;
            case 'ORGANIZER':
                return <User className="w-4 h-4 text-primary-600" />;
            case 'USER':
                return <User className="w-4 h-4 text-neutral-600" />;
            default:
                return <User className="w-4 h-4 text-neutral-600" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-error-100 text-error-700 border-error-200';
            case 'ORGANIZER':
                return 'bg-primary-100 text-primary-700 border-primary-200';
            case 'USER':
                return 'bg-neutral-100 text-neutral-700 border-neutral-200';
            default:
                return 'bg-neutral-100 text-neutral-700 border-neutral-200';
        }
    };

    const handleDeleteUser = async (userId: number, userName: string) => {

        if (currentUser?.id === userId) {
            message.error('You cannot delete your own account');
            return;
        }

        try {
            await deleteUser(userId);
            message.success(`User "${userName}" deleted successfully`);
        } catch (error) {
            message.error('Failed to delete user');
            console.error('Delete user error:', error);
        }
    };

    if (isLoading && users.length === 0) {
        return (
            <Container>
                <div className="py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-neutral-600">Loading users...</p>
                        </div>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-8">
                { }
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
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Manage Users</h1>
                    <p className="text-neutral-600">View and manage all platform users</p>
                </div>

                { }
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                label="Search Users"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="USER">Users</option>
                                <option value="ORGANIZER">Organizers</option>
                                <option value="ADMIN">Admins</option>
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
                                <option value="createdAt-desc">Newest First</option>
                                <option value="createdAt-asc">Oldest First</option>
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                                <option value="email-asc">Email A-Z</option>
                                <option value="email-desc">Email Z-A</option>
                            </select>
                        </div>
                    </div>
                </div>

                { }
                {error && (
                    <div className="mb-6 rounded-md border border-error-200 bg-error-50 p-4 text-error-700">
                        <div className="flex items-center justify-between">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchUsers(createQuery())}
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                { }
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        {user.profileImage ? (
                                            <img
                                                src={user.profileImage}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-primary-600" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-neutral-900 truncate">{user.name}</h3>
                                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                                            <Mail className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            {getRoleIcon(user.role)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                                    <div className="text-sm text-neutral-500 space-y-1">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                            <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs">
                                            <span>Events: {user.eventsCount || 0}</span>
                                            <span>•</span>
                                            <span>Registrations: {user.registrationsCount || 0}</span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0">
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                            disabled={user.role === "ADMIN" || isDeleting}
                                            loading={isDeleting}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                { }
                {users.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No users found</h3>
                        <p className="text-neutral-600">
                            {searchTerm || roleFilter !== 'ALL'
                                ? 'Try adjusting your search or filters.'
                                : 'There are no users registered yet.'
                            }
                        </p>
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-6 mt-6">
                        { }
                        <div className="text-sm text-neutral-700">
                            Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalItems} total users
                        </div>

                        { }
                        <div className="flex items-center space-x-2">
                            { }
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1 || isLoading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>

                            { }
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

                            { }
                            <div className="sm:hidden text-sm text-neutral-600">
                                {pagination.currentPage} / {pagination.totalPages}
                            </div>

                            { }
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

export default AdminManageUsersPage;