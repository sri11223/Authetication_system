'use client';

import React from 'react';
import { Session } from '@/types';
import { SessionCard } from './SessionCard';
import { Spinner } from '@/components/ui/Spinner';
import { Monitor, RefreshCw, Trash2 } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  isLoading: boolean;
  isRevoking: string | null;
  onRevoke: (sessionId: string) => void;
  onRevokeAll: () => void;
  onRefresh: () => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  isLoading,
  isRevoking,
  onRevoke,
  onRevokeAll,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="w-12 h-12 mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse">
          <Monitor className="w-6 h-6 text-white" />
        </div>
        <Spinner size="md" label="Loading sessions..." />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-2xl flex items-center justify-center">
          <Monitor className="w-8 h-8 text-slate-500" />
        </div>
        <p className="text-slate-400 font-medium">No active sessions found</p>
        <p className="text-sm text-slate-500 mt-1">Your sessions will appear here when you log in</p>
      </div>
    );
  }

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div>
      {/* Header actions */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-surface-500 dark:text-slate-400 font-medium">
          <span className="text-lg font-bold text-surface-900 dark:text-white">{sessions.length}</span> active {sessions.length === 1 ? 'session' : 'sessions'}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-100 dark:bg-slate-800 hover:bg-surface-200 dark:hover:bg-slate-700 text-surface-500 dark:text-slate-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {otherSessions.length > 0 && (
            <button
              onClick={onRevokeAll}
              disabled={isRevoking === 'all'}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
            >
              {isRevoking === 'all' ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Revoke All Others
            </button>
          )}
        </div>
      </div>

      {/* Current session - highlighted */}
      {currentSession && (
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-surface-400 dark:text-slate-500 font-semibold mb-3">Current Session</h3>
          <SessionCard
            session={currentSession}
            onRevoke={onRevoke}
            isRevoking={isRevoking === currentSession._id}
          />
        </div>
      )}

      {/* Other sessions */}
      {otherSessions.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-surface-400 dark:text-slate-500 font-semibold mb-3">Other Devices</h3>
          <div className="space-y-3">
            {otherSessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onRevoke={onRevoke}
                isRevoking={isRevoking === session._id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
