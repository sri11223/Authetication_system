'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useForm } from '@/hooks/useForm';
import { ChangePasswordFormData, UpdateProfileFormData, ActivityLog } from '@/types';
import {
  Lock,
  User,
  History,
  CheckCircle,
  AlertCircle,
  Shield,
  Key,
  Clock,
  MapPin,
  Monitor,
  Settings,
  Mail,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

type TabType = 'password' | 'profile' | 'activity' | 'settings';

export default function SecurityPage() {
  return (
    <ProtectedRoute>
      <SecurityContent />
    </ProtectedRoute>
  );
}

function SecurityContent() {
  const [activeTab, setActiveTab] = useState<TabType>('password');
  const { user, refreshUser } = useAuth();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100">Security Settings</h1>
              <p className="text-surface-500 dark:text-surface-400 text-sm">Manage your account security and activity</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-surface-200 dark:border-surface-700 overflow-x-auto">
          {[
            { id: 'password' as TabType, label: 'Change Password', icon: Key },
            { id: 'profile' as TabType, label: 'Update Profile', icon: User },
            { id: 'activity' as TabType, label: 'Activity Log', icon: History },
            { id: 'settings' as TabType, label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'password' && <ChangePasswordTab />}
        {activeTab === 'profile' && <UpdateProfileTab user={user} onUpdate={refreshUser} />}
        {activeTab === 'activity' && <ActivityLogTab />}
        {activeTab === 'settings' && <SettingsTab user={user} onUpdate={refreshUser} />}
      </main>
    </div>
  );
}

function ChangePasswordTab() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { values, errors, handleChange, handleSubmit, reset } = useForm<ChangePasswordFormData>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof ChangePasswordFormData, string>> = {};

      if (!values.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }

      if (!values.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (values.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(values.newPassword)
      ) {
        errors.newPassword =
          'Password must contain uppercase, lowercase, number, and special character';
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (values.currentPassword === values.newPassword) {
        errors.newPassword = 'New password must be different from current password';
      }

      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      setMessage(null);

      try {
        const response = await authService.changePassword(values);
        if (response.success) {
          setMessage({ type: 'success', text: response.message || 'Password changed successfully' });
          reset();
          // Logout user after password change (all sessions invalidated)
          setTimeout(() => {
            logout();
          }, 2000);
        }
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to change password. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Card>
      <CardHeader
        title="Change Password"
        subtitle="Update your password to keep your account secure. You'll be logged out from all devices after changing your password."
      />

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-6">
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-surface-700 mb-2">
            Current Password
          </label>
          <Input
            id="currentPassword"
            type="password"
            value={values.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            placeholder="Enter your current password"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-surface-700 mb-2">
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            value={values.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            placeholder="Enter your new password"
            disabled={loading}
          />
          <p className="text-xs text-surface-500 mt-1.5">
            Must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700 mb-2">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your new password"
            disabled={loading}
          />
        </div>

        <Button type="submit" fullWidth disabled={loading} className="h-12">
          {loading ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Changing Password...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

function UpdateProfileTab({ user, onUpdate }: { user: any; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { values, errors, handleChange, handleSubmit } = useForm<UpdateProfileFormData>({
    initialValues: {
      name: user?.name || '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof UpdateProfileFormData, string>> = {};

      if (!values.name) {
        errors.name = 'Name is required';
      } else if (values.name.length < 2) {
        errors.name = 'Name must be at least 2 characters';
      } else if (values.name.length > 50) {
        errors.name = 'Name cannot exceed 50 characters';
      }

      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      setMessage(null);

      try {
        const response = await authService.updateProfile(values);
        if (response.success) {
          setMessage({ type: 'success', text: 'Profile updated successfully' });
          onUpdate();
        }
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to update profile. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Card>
      <CardHeader title="Update Profile" subtitle="Update your account information" />

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-6">
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-surface-700 mb-2">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your full name"
            disabled={loading}
          />
        </div>

        <div className="p-4 bg-surface-50 rounded-xl">
          <p className="text-xs text-surface-500 uppercase tracking-wider font-medium mb-1">Email Address</p>
          <p className="text-sm font-semibold text-surface-900">{user?.email}</p>
          <p className="text-xs text-surface-500 mt-1">Email cannot be changed</p>
        </div>

        <Button type="submit" fullWidth disabled={loading} className="h-12">
          {loading ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Update Profile
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

function ActivityLogTab() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await authService.getActivityLog(50);
        if (response.success && response.data) {
          setActivities(response.data.activities);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load activity log');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'logout':
      case 'logout_all':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'password_reset':
      case 'password_changed':
        return <Lock className="w-4 h-4 text-red-600" />;
      case 'profile_updated':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'email_verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'session_revoked':
        return <Monitor className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-surface-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Activity Log" subtitle="Recent security events and account activity" />
        <div className="flex items-center justify-center py-12">
          <Spinner className="w-6 h-6" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Activity Log" subtitle="Recent security events and account activity" />
        <Alert variant="error">{error}</Alert>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Activity Log"
        subtitle={`${activities.length} recent security events and account activity`}
      />

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="flex items-start gap-4 p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-surface-900">{activity.description}</p>
                  <span className="text-xs text-surface-500 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-500">
                  {activity.ip && activity.ip !== 'Unknown' && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.ip === 'Localhost (Development)' ? 'Localhost' : activity.ip}
                    </span>
                  )}
                  {activity.userAgent && activity.userAgent !== 'Unknown' && (
                    <span className="flex items-center gap-1 truncate">
                      <Monitor className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{activity.userAgent}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SettingsTab({ user, onUpdate }: { user: any; onUpdate: () => void }) {
  const { logout } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleNotifications = async () => {
    setLoading(true);
    try {
      const response = await authService.updateEmailNotifications(!emailNotifications);
      if (response.success) {
        setEmailNotifications(!emailNotifications);
        setMessage({ type: 'success', text: 'Email notifications updated' });
        onUpdate();
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update email notifications',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage({ type: 'error', text: 'Please enter your password' });
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await authService.deleteAccount(deletePassword);
      if (response.success) {
        setTimeout(() => {
          logout();
        }, 1000);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete account. Please check your password.',
      });
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader title="Account Settings" subtitle="Manage your account preferences and security" />

        {message && (
          <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-6">
            {message.text}
          </Alert>
        )}

        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                  Email Security Notifications
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Receive email alerts for security events (logins, password changes, etc.)
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleNotifications}
              disabled={loading}
              className="flex-shrink-0"
            >
              {emailNotifications ? (
                <ToggleRight className="w-10 h-6 text-primary-600 dark:text-primary-400" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-surface-400" />
              )}
            </button>
          </div>

          {/* Account Deletion */}
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">
                  Delete Account
                </p>
                <p className="text-xs text-surface-600 dark:text-surface-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Delete Account
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-sm text-surface-700 dark:text-surface-300 mb-4">
              To confirm account deletion, please enter your password:
            </p>

            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              disabled={deleteLoading}
              className="mb-4"
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                disabled={deleteLoading}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword}
                fullWidth
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
