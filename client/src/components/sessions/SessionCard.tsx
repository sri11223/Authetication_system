'use client';

import React from 'react';
import { Session } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Monitor, Smartphone, Tablet, Globe, Clock, MapPin, Trash2 } from 'lucide-react';

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
        relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 group
        ${session.isCurrent
          ? 'border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10'
          : 'border-surface-200 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:border-purple-200 dark:hover:border-purple-500/20 hover:shadow-lg dark:hover:shadow-purple-500/5'
        }
      `}
    >
      {/* Current session indicator */}
      {session.isCurrent && (
        <div className="absolute -left-px top-4 bottom-4 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full" />
      )}

      {/* Device icon */}
      <div
        className={`
          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
          ${session.isCurrent
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
            : 'bg-surface-100 dark:bg-slate-800 text-surface-500 dark:text-slate-400'
          }
        `}
      >
        {deviceIcon}
      </div>

      {/* Session details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-base font-bold text-surface-900 dark:text-white truncate">
            {session.deviceInfo.browser} on {session.deviceInfo.os}
          </h4>
          {session.isCurrent && (
            <Badge variant="success">
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Current
              </span>
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-surface-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" />
            {session.deviceInfo.device} · {session.deviceInfo.platform}
          </span>
          <span className="flex items-center gap-1.5" title={`IP: ${session.deviceInfo.ip}`}>
            <MapPin className="w-3.5 h-3.5" />
            {session.deviceInfo.ip === 'Localhost' || session.deviceInfo.ip === '::1' || session.deviceInfo.ip === '127.0.0.1'
              ? 'Localhost'
              : session.deviceInfo.ip}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formatLastActive(session.lastActiveAt)}
          </span>
        </div>
      </div>

      {/* Revoke button */}
      {!session.isCurrent && (
        <button
          onClick={() => onRevoke(session._id)}
          disabled={isRevoking}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRevoking ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Revoke
        </button>
      )}
    </div>
  );
};
