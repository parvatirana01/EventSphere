import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    FileText,
    TrendingUp,
    Clock
} from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import websocketService from '../services/Websocket.service';
import { useSocketStore } from '../store/socketStore';
import useOrganizerRequestStore from '../store/organizerRequestStore';
import { message } from 'antd';




const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [onlineUsers, setOnlineUsers] = useState(0);
    const { isConnected } = useSocketStore();

    const { allRequests, fetchAllRequests, isLoading: requestsLoading ,error:requestsError,clearError} = useOrganizerRequestStore();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        activeEvents: 0,
        totalRegistrations: 0,
        pendingRequests: 0,
        updatedAt: '' 
    });

    useEffect(() => {
        if (requestsError) {
            message.error(requestsError);
            clearError()
        }
    }, [requestsError]);

    useEffect(() => {
        fetchAllRequests({ page: 1, limit: 10, sortOrder: 'desc' });
    }, [fetchAllRequests]);

    useEffect(() => {
        const onStats = (s:any)=>{ console.log('Received stats update:', s); setStats(s); };
        const onOnline = (d:any)=>{ console.log('Received online update:', d); setOnlineUsers(d.onlineUsers); };
        const onWsErr = (e:any)=> console.error('WebSocket error:', e);
        const onWsConnect = () => {
          console.log('WS connected – requesting admin stats');
          websocketService.emit('request_admin_stats');
        };
      
        websocketService.on('dashboard_stats_update', onStats);
        websocketService.on('dashboard_online_update', onOnline);
        websocketService.on('error', onWsErr);
        websocketService.on('connect', onWsConnect);
   
        
        if (isConnected) onWsConnect();
      
        return () => {
          websocketService.off('dashboard_stats_update',onStats);
          websocketService.off('dashboard_online_update',onOnline);
          websocketService.off('error',onWsErr);
          websocketService.off('connect',onWsConnect);
        };
    }, [isConnected]);



    return (
        <Container>
            <div className="py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
                            <p className="text-neutral-600">Overview of platform activity and management</p>
                        </div>
                        {stats.updatedAt && (
                            <div className="text-sm text-gray-500 text-right">
                                <div>Last Updated</div>
                                <div>{new Date(stats.updatedAt).toLocaleString()}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4 text-gray-600">
                    Online Users: {onlineUsers}
                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Total Users</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Total Events</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats.totalEvents}</p>
                                <p className="text-sm text-neutral-600 mt-1">{stats.activeEvents} active</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Pending Requests</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats.pendingRequests}</p>
                                <p className="text-sm text-warning-600 mt-1">Requires attention</p>
                            </div>
                            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-warning-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Total Registrations</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats.totalRegistrations.toLocaleString()}</p>
                                <p className="text-sm text-success-600 mt-1">Growing steadily</p>
                            </div>
                            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-success-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-neutral-900">Recent Activity</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/admin/users')}
                            >
                                View All
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="text-center py-4">
                                <p className="text-sm text-neutral-500">Recent activity will be displayed here</p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-neutral-900">Pending Organizer Requests</h2>
                                <p className="text-sm text-neutral-600">
                                    {allRequests.filter(req => req.status === 'PENDING').length} pending
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/admin/organizer-requests')}
                            >
                                View All
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {requestsLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <LoadingSpinner size="sm" />
                                </div>
                            ) : allRequests.filter(req => req.status === 'PENDING').length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-neutral-500">No pending requests</p>
                                </div>
                            ) : (
                                allRequests
                                    .filter(req => req.status === 'PENDING')
                                    .slice(0, 3)
                                    .map((request) => (
                                        <div key={request.id} className="border border-neutral-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-medium text-neutral-900">
                                                    {request.user?.name || 'Unknown User'}
                                                </h3>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
                                                    PENDING
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-600 mb-3">
                                                {request.overview || 'No overview provided'}
                                            </p>
                                            {request.resume && (
                                                <div className="mb-3">
                                                    <div className="flex items-center space-x-2 text-sm text-neutral-600">
                                                        <FileText className="w-4 h-4 text-primary-600" />
                                                        <a
                                                            href={request.resume}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary-600 hover:text-primary-700 underline cursor-pointer"
                                                        >
                                                            View Resume
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-neutral-500">
                                                    {new Date(request.createdAt).toLocaleString()}
                                                </span>
                                                <div className="flex space-x-2">

                                                    <Button
                                                        size="sm"
                                                        onClick={() => navigate('/admin/organizer-requests')}
                                                    >
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button
                            className="justify-start"
                            variant="outline"
                            onClick={() => navigate('/admin/users')}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Manage Users
                        </Button>
                        <Button
                            className="justify-start"
                            variant="outline"
                            onClick={() => navigate('/admin/events')}
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Manage Events
                        </Button>
                        <Button
                            className="justify-start"
                            variant="outline"
                            onClick={() => navigate('/admin/organizer-requests')}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Review Requests
                        </Button>

                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AdminDashboardPage;