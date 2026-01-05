import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Session, Note } from '@/types';

export const useSessions = (status?: string) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const response = await api.get('/sessions', { params });
      setSessions(response.data.sessions);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [status]);

  return { sessions, loading, refetch: fetchSessions };
};

export const useSession = (sessionId: string) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      setSession(response.data.session);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  return { session, loading, refetch: fetchSession };
};

export const useNotes = (sessionId: string) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      // Notes endpoint: GET /api/sessions/:sessionId/notes
      const response = await api.get(`/sessions/${sessionId}/notes`);
      setNotes(response.data.notes || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (content: string) => {
    try {
      // Notes endpoint: POST /api/sessions/:sessionId/notes
      const response = await api.post(`/sessions/${sessionId}/notes`, { content });
      await fetchNotes();
      return response.data.note;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to save note');
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchNotes();
    }
  }, [sessionId]);

  return { notes, loading, saveNote, refetch: fetchNotes };
};

