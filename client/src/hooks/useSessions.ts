'use client';

import { useState, useCallback, useEffect } from 'react';
import { Session } from '@/types';
import { sessionService } from '@/services/session.service';
import toast from 'react-hot-toast';

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await sessionService.getActiveSessions();
      if (response.success && response.data) {
        setSessions(response.data.sessions);
      }
    } catch {
      toast.error('Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      setIsRevoking(sessionId);
      await sessionService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      toast.success('Session revoked successfully');
    } catch {
      toast.error('Failed to revoke session');
    } finally {
      setIsRevoking(null);
    }
  }, []);

  const revokeOtherSessions = useCallback(async () => {
    try {
      setIsRevoking('all');
      await sessionService.revokeOtherSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success('All other sessions revoked');
    } catch {
      toast.error('Failed to revoke other sessions');
    } finally {
      setIsRevoking(null);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    isRevoking,
    fetchSessions,
    revokeSession,
    revokeOtherSessions,
  };
};
