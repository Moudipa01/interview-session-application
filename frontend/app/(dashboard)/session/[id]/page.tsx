'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSession, useNotes } from '@/hooks/useSession';
import Navbar from '@/components/Layout/Navbar';
import { api } from '@/lib/api';
import { Session } from '@/types';

export default function SessionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { session, loading: sessionLoading, refetch: refetchSession } = useSession(sessionId);
  const { notes, loading: notesLoading, saveNote, refetch: refetchNotes } = useNotes(sessionId);

  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [remoteVideoStream, setRemoteVideoStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Initialize WebRTC (placeholder/scaffolding)
  useEffect(() => {
    if (!session || session.status !== 'accepted') return;

    const initializeWebRTC = async () => {
      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setLocalVideoStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Create peer connection (basic setup - no signaling server)
        // NOTE: This is a placeholder. In production, you'd need:
        // - Signaling server (WebSocket/Socket.io)
        // - STUN/TURN servers for NAT traversal
        // - Proper offer/answer exchange

        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }, // Public STUN server
            // TURN servers would be added here in production
          ],
        };

        const pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;

        // Add local stream tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setRemoteVideoStream(event.streams[0]);
          }
        };

        // Handle ICE candidates (placeholder - would be sent via signaling)
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            // In production: send to peer via signaling server
            console.log('ICE candidate:', event.candidate);
          }
        };
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeWebRTC();

    return () => {
      // Cleanup
      if (localVideoStream) {
        localVideoStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [session]);

  // Auto-save notes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (noteContent.trim() && session) {
        handleSaveNote();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [noteContent]);

  const handleSaveNote = async () => {
    if (!noteContent.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await saveNote(noteContent);
      setNoteContent('');
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartSession = async () => {
    try {
      await api.put(`/sessions/${sessionId}/start`);
      refetchSession();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to start session');
    }
  };

  const handleEndSession = async () => {
    try {
      await api.put(`/sessions/${sessionId}/end`);
      refetchSession();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to end session');
    }
  };

  const handleAcceptSession = async () => {
    try {
      await api.put(`/sessions/${sessionId}/accept`);
      refetchSession();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept session');
    }
  };

  const handleRejectSession = async () => {
    try {
      await api.put(`/sessions/${sessionId}/reject`);
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject session');
    }
  };

  if (authLoading || sessionLoading || !user || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const otherUser =
    user.role === 'interviewer'
      ? (session.intervieweeId as any)
      : (session.interviewerId as any);

  const canStart = session.status === 'accepted' && !session.startedAt;
  const isActive = session.startedAt && !session.endedAt;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Interview Session</h1>
          <p className="text-gray-600 mt-2">
            {session.subject} with {otherUser?.fullName || 'Unknown'}
          </p>
        </div>

        {/* Session Actions */}
        {user.role === 'interviewer' && session.status === 'pending' && (
          <div className="mb-6 flex gap-4">
            <button
              onClick={handleAcceptSession}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Accept Session
            </button>
            <button
              onClick={handleRejectSession}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject Session
            </button>
          </div>
        )}

        {canStart && (
          <div className="mb-6">
            <button
              onClick={handleStartSession}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Start Session
            </button>
          </div>
        )}

        {isActive && (
          <div className="mb-6">
            <button
              onClick={handleEndSession}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              End Session
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Video Call</h2>
            {session.status === 'accepted' ? (
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!remoteVideoStream && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      Waiting for remote video...
                    </div>
                  )}
                </div>
                <div className="relative bg-gray-800 rounded-lg overflow-hidden w-48 h-36">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                {session.startedAt && (
                  <div className="text-sm text-gray-600">
                    Session started: {new Date(session.startedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Session must be accepted before video is available
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>

            <div className="mb-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your notes here... (auto-saves)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 resize-none"
              />
              <button
                onClick={handleSaveNote}
                disabled={isSaving || !noteContent.trim()}
                className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm"
              >
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Session Notes</h3>
              {notesLoading ? (
                <p className="text-sm text-gray-500">Loading notes...</p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes yet</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note._id} className="border rounded p-3 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">
                          {(note.authorId as any)?.fullName || 'Unknown'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

