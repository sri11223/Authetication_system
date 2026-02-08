'use client';

import React from 'react';
import { Session } from '@/types';
import { SessionCard } from './SessionCard';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Monitor, RefreshCw } from 'lucide-react';

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
      <div className="py-12">
        <Spinner size="md" label="Loading sessions..." />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Monitor className="w-12 h-12 text-surface-300 mx-auto mb-3" />
        <p className="text-surface-500">No active sessions found</p>
      </div>
    );
  }

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div>
      {/* Header actions */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-500">
          {sessions.length} active {sessions.length === 1 ? 'session' : 'sessions'}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          {otherSessions.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={onRevokeAll}
              isLoading={isRevoking === 'all'}
            >
              Revoke All Others
            </Button>
          )}
        </div>
      </div>

      {/* Session cards */}
      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard
            key={session._id}
            session={session}
            onRevoke={onRevoke}
            isRevoking={isRevoking === session._id}
          />
        ))}
      </div>
    </div>
  );
};
