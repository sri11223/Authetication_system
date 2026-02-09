'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Card, CardHeader } from '@/components/ui/Card';
import { SessionList } from '@/components/sessions/SessionList';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useSessions } from '@/hooks/useSessions';
import { Shield, AlertTriangle, Info } from 'lucide-react';

export default function SessionsPage() {
  return (
    <ProtectedRoute>
      <SessionsContent />
    </ProtectedRoute>
  );
}

function SessionsContent() {
  const {
    sessions,
    isLoading,
    isRevoking,
    fetchSessions,
    revokeSession,
    revokeOtherSessions,
  } = useSessions();

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    sessionId?: string;
    title: string;
  }>({ isOpen: false, type: 'single', title: '' });

  const handleRevokeClick = (sessionId: string) => {
    const session = sessions.find((s) => s._id === sessionId);
    setConfirmModal({
      isOpen: true,
      type: 'single',
      sessionId,
      title: `Revoke session from ${session?.deviceInfo.browser || 'Unknown'} on ${session?.deviceInfo.os || 'Unknown'}?`,
    });
  };

  const handleRevokeAllClick = () => {
    setConfirmModal({
      isOpen: true,
      type: 'all',
      title: 'Revoke all other sessions?',
    });
  };

  const handleConfirm = async () => {
    if (confirmModal.type === 'single' && confirmModal.sessionId) {
      await revokeSession(confirmModal.sessionId);
    } else if (confirmModal.type === 'all') {
      await revokeOtherSessions();
    }
    setConfirmModal({ isOpen: false, type: 'single', title: '' });
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Active Sessions</h1>
          <p className="mt-1 text-surface-500 dark:text-slate-400">
            Manage your active login sessions across all devices
          </p>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Sessions are tracked with device fingerprinting. Revoke access from any device you don't recognize to keep your account secure.
          </p>
        </div>

        {/* Sessions Card */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Logged-in Devices</h2>
              <p className="text-sm text-surface-500 dark:text-slate-400">These devices are currently logged into your account</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-slate-400">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="hidden sm:inline">Secured by JWT</span>
            </div>
          </div>

          <SessionList
            sessions={sessions}
            isLoading={isLoading}
            isRevoking={isRevoking}
            onRevoke={handleRevokeClick}
            onRevokeAll={handleRevokeAllClick}
            onRefresh={fetchSessions}
          />
        </div>

        {/* Security Info */}
        <div className="mt-6 p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900 dark:text-white mb-2">About Session Security</h3>
              <ul className="space-y-1.5 text-sm text-surface-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                  Concurrent logins are handled atomically to prevent duplicate sessions
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                  Changing your password automatically invalidates all active sessions
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                  Sessions expire automatically after 7 days of inactivity
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                  MongoDB transactions ensure data integrity under race conditions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: 'single', title: '' })}
        title="Confirm Action"
        maxWidth="sm"
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-surface-700 dark:text-white mb-1 font-semibold">{confirmModal.title}</p>
          <p className="text-xs text-surface-500 dark:text-slate-400 mb-6">
            {confirmModal.type === 'all'
              ? 'This will log you out from all other devices. You will remain logged in on this device only.'
              : 'This device will be immediately logged out and will need to sign in again.'
            }
          </p>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setConfirmModal({ isOpen: false, type: 'single', title: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleConfirm}
              isLoading={isRevoking !== null}
            >
              Revoke
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
