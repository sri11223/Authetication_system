'use client';

import React from 'react';
import { Session } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Monitor, Smartphone, Tablet, Globe, Clock, MapPin } from 'lucide-react';

interface SessionCardProps {
  session: Session;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  Desktop: <Monitor className="w-5 h-5" />,
  Mobile: <Smartphone className="w-5 h-5" />,
  Tablet: <Tablet className="w-5 h-5" />,
};

const formatLastActive = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const SessionCard: React.FC<SessionCardProps> = ({ session, onRevoke, isRevoking }) => {
  const deviceIcon = DEVICE_ICONS[session.deviceInfo.device] || <Globe className="w-5 h-5" />;

  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-xl border transition-all duration-200
        ${session.isCurrent
          ? 'border-primary-200 bg-primary-50/50'
          : 'border-surface-200 bg-white hover:border-surface-300'
        }
      `}
    >
      {/* Device icon */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
          ${session.isCurrent ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-500'}
        `}
      >
        {deviceIcon}
      </div>

      {/* Session details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-surface-900 truncate">
            {session.deviceInfo.browser} on {session.deviceInfo.os}
          </h4>
          {session.isCurrent && <Badge variant="info">Current</Badge>}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500">
          <span className="flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            {session.deviceInfo.device} &middot; {session.deviceInfo.platform}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {session.deviceInfo.ip}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatLastActive(session.lastActiveAt)}
          </span>
        </div>
      </div>

      {/* Revoke button */}
      {!session.isCurrent && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => onRevoke(session._id)}
          isLoading={isRevoking}
          className="flex-shrink-0"
        >
          Revoke
        </Button>
      )}
    </div>
  );
};
