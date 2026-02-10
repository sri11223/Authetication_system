'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminService, SystemStats } from '@/services/admin.service';
import AdminLayout from '@/components/layout/AdminLayout';
import { Users, ShieldCheck, Activity, Clock } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { toast } from 'react-hot-toast';



const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        // In a real app, checking role here is good, but middleware also protects it.
        // For now, we'll assume if they can hit the API, they are admin.
        // Ideally we should redirect if role !== 'admin'
        if (!isLoading && user && user.role !== 'admin') {
            router.push('/dashboard'); // Kick non-admins out
            return;
        }

        const fetchStats = async () => {
            try {
                const data = await adminService.getStats();
                setStats(data);
            } catch (error: any) {
                console.error('Failed to fetch stats', error);
                toast.error(error.response?.data?.message || 'Failed to fetch dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchStats();
        }
    }, [user, isAuthenticated, isLoading, router]);

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back, Admin!</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={Users}
                        color="text-blue-600"
                        bg="bg-blue-100"
                    />
                    <StatCard
                        title="Active Sessions"
                        value={stats?.activeSessions || 0}
                        icon={Activity}
                        color="text-green-600"
                        bg="bg-green-100"
                    />
                    <StatCard
                        title="Verified Users"
                        value={`${stats?.verifiedPercentage || 0}%`}
                        icon={ShieldCheck}
                        color="text-purple-600"
                        bg="bg-purple-100"
                    />
                    <StatCard
                        title="24h Logins"
                        value={stats?.recentLogins || 0}
                        icon={Clock}
                        color="text-orange-600"
                        bg="bg-orange-100"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Trend Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Login Trends (7 Days)</h3>
                        <div className="h-80">
                            {stats?.loginTrends && stats.loginTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.loginTrends}>
                                        <defs>
                                            <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="logins"
                                            stroke="#3B82F6"
                                            fillOpacity={1}
                                            fill="url(#colorLogins)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No login data available yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* OS Distribution Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">OS Distribution</h3>
                        <div className="h-80">
                            {stats?.osDistribution && stats.osDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.osDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.osDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No OS data available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bg: string;
}

function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center shadow-hover transition-shadow">
            <div className={`p-4 rounded-lg ${bg} ${color} mr-4`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
