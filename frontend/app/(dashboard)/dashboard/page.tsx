'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Layout/Navbar';
import { useSessions } from '@/hooks/useSession';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { sessions, loading: sessionsLoading } = useSessions();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const upcomingSessions = sessions.filter((s) => ['pending', 'accepted'].includes(s.status));
  const pastSessions = sessions.filter((s) => ['completed', 'rejected', 'cancelled'].includes(s.status));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.fullName}!</p>
        </div>

        {user.role === 'interviewee' && (
          <div className="mb-8">
            <Link
              href="/match"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Find Interviewers
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
            {sessionsLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : upcomingSessions.length === 0 ? (
              <p className="text-gray-500">No upcoming sessions</p>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  const otherUser =
                    user.role === 'interviewer'
                      ? (session.intervieweeId as any)
                      : (session.interviewerId as any);
                  return (
                    <Link
                      key={session._id}
                      href={`/session/${session._id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {otherUser?.fullName || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">{session.subject}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Status: {session.status}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            session.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Past Sessions</h2>
            {sessionsLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : pastSessions.length === 0 ? (
              <p className="text-gray-500">No past sessions</p>
            ) : (
              <div className="space-y-4">
                {pastSessions.map((session) => {
                  const otherUser =
                    user.role === 'interviewer'
                      ? (session.intervieweeId as any)
                      : (session.interviewerId as any);
                  return (
                    <Link
                      key={session._id}
                      href={`/session/${session._id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {otherUser?.fullName || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">{session.subject}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {session.endedAt
                              ? new Date(session.endedAt).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                          {session.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

