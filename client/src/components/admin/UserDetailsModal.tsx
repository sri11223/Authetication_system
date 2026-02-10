'use client';

import React from 'react';
import { User, Session, ActivityLog } from '@/types';
import { X, Shield, Globe, Clock, Smartphone, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    sessions: Session[];
    activity: ActivityLog[];
    isLoading: boolean;
}

export function UserDetailsModal({
    isOpen,
    onClose,
    user,
    sessions,
    activity,
    isLoading
}: UserDetailsModalProps) {
    if (!isOpen) return null;

    // Prevent scrolling on body when modal is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getDeviceIcon = (device: string) => {
        if (device?.toLowerCase().includes('mobile')) return <Smartphone className="w-4 h-4" />;
        return <Monitor className="w-4 h-4" />;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal Panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            onClick={onClose}
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : user ? (
                            <div className="space-y-8">
                                {/* Header / Profile */}
                                <div className="flex items-start gap-6">
                                    <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                                        <p className="text-gray-500">{user.email}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Badge variant={user.role === 'admin' ? 'info' : 'warning'}>{(user.role || 'user').toUpperCase()}</Badge>
                                            <Badge variant={user.isEmailVerified ? 'success' : 'warning'}>
                                                {user.isEmailVerified ? 'Verified' : 'Pending'}
                                            </Badge>
                                            {user.twoFactorEnabled && <Badge variant="success">2FA Enabled</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-2">ID: {user.id}</p>
                                        <p className="text-sm text-gray-400">Joined: {formatDate(user.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Grid Layout for Sessions and Activity */}
                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Sessions Column */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-gray-500" />
                                            Active Sessions
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-100">
                                            {sessions.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">No active sessions found.</div>
                                            ) : (
                                                sessions.map((session) => (
                                                    <div key={session._id} className="p-4 flex items-start gap-3">
                                                        <div className="mt-1 text-gray-400">
                                                            {getDeviceIcon(session.deviceInfo?.device || 'desktop')}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {session.deviceInfo?.browser || 'Unknown Browser'} on {session.deviceInfo?.os || 'Unknown OS'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                IP: {session.deviceInfo?.ip || 'Unknown'} - {session.deviceInfo?.platform || 'Unknown'}
                                                            </p>
                                                            {session.isCurrent && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                                    Current Session
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400 whitespace-nowrap">
                                                            {new Date(session.lastActiveAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Activity Column */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-gray-500" />
                                            Recent Activity
                                        </h4>
                                        <div className="bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                                            {activity.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">No recent activity.</div>
                                            ) : (
                                                <ul className="divide-y divide-gray-200">
                                                    {activity.map((log) => (
                                                        <li key={log._id} className="p-4 hover:bg-gray-50">
                                                            <div className="flex space-x-3">
                                                                <div className="flex-1 space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="text-sm font-medium text-gray-900 capitalize">
                                                                            {log.type.replace(/_/g, ' ')}
                                                                        </h3>
                                                                        <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-500">{log.description}</p>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                                        <span>{log.ip}</span>
                                                                        <span>•</span>
                                                                        <span className="truncate max-w-[150px]">{log.userAgent}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                Failed to load user details.
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
