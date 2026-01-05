'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMatch } from '@/hooks/useMatch';
import Navbar from '@/components/Layout/Navbar';
import api from '@/lib/api';
import { User } from '@/types';

export default function MatchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { findInterviewers, interviewers, loading: matchLoading } = useMatch();
  const [subject, setSubject] = useState('');
  const [radius, setRadius] = useState(5);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'interviewee')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.location) {
      setLocation({
        lat: user.location.coordinates[1],
        lng: user.location.coordinates[0],
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setError('Unable to retrieve location');
        }
      );
    }
  }, [user]);

  const handleSearch = async () => {
    if (!subject || !location) {
      setError('Please enter a subject and ensure location is available');
      return;
    }

    setError('');
    try {
      await findInterviewers(subject, radius, location);
    } catch (err: any) {
      setError(err.message || 'Failed to find interviewers');
    }
  };

  const handleRequestSession = async (interviewerId: string) => {
    try {
      await api.post('/sessions', {
        interviewerId,
        subject,
      });
      alert('Session request sent!');
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to request session');
    }
  };

  if (authLoading || !user || user.role !== 'interviewee') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Interviewers</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Software Engineering"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius (km)
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={matchLoading || !location}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {matchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {location && (
            <p className="mt-4 text-sm text-gray-600">
              Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewers.map((interviewer: User) => (
            <div key={interviewer._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold">{interviewer.fullName}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {interviewer.yearsOfExperience} years of experience
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Domains:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {interviewer.domains?.map((domain, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Availability: {interviewer.availabilityRadius} km radius
                </p>
                {(interviewer as any).activeSessions !== undefined && (
                  <p className="text-sm text-gray-600">
                    Active sessions: {(interviewer as any).activeSessions}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRequestSession(interviewer._id)}
                className="mt-4 w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Request Session
              </button>
            </div>
          ))}
        </div>

        {!matchLoading && interviewers.length === 0 && subject && (
          <div className="text-center py-12">
            <p className="text-gray-500">No interviewers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

