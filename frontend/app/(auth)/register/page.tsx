'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'interviewee' as 'interviewer' | 'interviewee',
    location: { lat: 0, lng: 0 },
    // Interviewer fields
    yearsOfExperience: '',
    domains: [] as string[],
    availabilityRadius: 5,
    // Interviewee fields
    currentStatus: 'student' as 'student' | 'professional',
    yearOfStudy: '',
    domain: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
        setLocationError('');
      },
      () => {
        setLocationError('Unable to retrieve your location');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.location.lat || !formData.location.lng) {
      setLocationError('Please allow location access');
      return;
    }

    setLoading(true);

    try {
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        location: formData.location,
      };

      if (formData.role === 'interviewer') {
        registerData.yearsOfExperience = parseInt(formData.yearsOfExperience);
        registerData.domains = formData.domains;
        registerData.availabilityRadius = formData.availabilityRadius;
      } else {
        registerData.currentStatus = formData.currentStatus;
        if (formData.currentStatus === 'student') {
          registerData.yearOfStudy = parseInt(formData.yearOfStudy);
        } else {
          registerData.domain = formData.domain;
        }
      }

      await register(registerData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const commonDomains = ['Software Engineering', 'Data Science', 'Product Management', 'Design', 'Business', 'Marketing'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create your MockMate account</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'interviewer' | 'interviewee' })}
              >
                <option value="interviewee">Interviewee</option>
                <option value="interviewer">Interviewer</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <button
              type="button"
              onClick={getLocation}
              className="mt-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Get My Location
            </button>
            {formData.location.lat && formData.location.lng && (
              <p className="mt-2 text-sm text-green-600">
                Location: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
              </p>
            )}
            {locationError && <p className="mt-2 text-sm text-red-600">{locationError}</p>}
          </div>

          {/* Interviewer fields */}
          {formData.role === 'interviewer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Domains (select all that apply)</label>
                <div className="mt-2 space-y-2">
                  {commonDomains.map((domain) => (
                    <label key={domain} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.domains.includes(domain)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, domains: [...formData.domains, domain] });
                          } else {
                            setFormData({ ...formData, domains: formData.domains.filter((d) => d !== domain) });
                          }
                        }}
                      />
                      {domain}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Availability Radius (km)</label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.availabilityRadius}
                  onChange={(e) => setFormData({ ...formData, availabilityRadius: parseInt(e.target.value) })}
                />
              </div>
            </>
          )}

          {/* Interviewee fields */}
          {formData.role === 'interviewee' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.currentStatus}
                  onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as 'student' | 'professional' })}
                >
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              {formData.currentStatus === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.yearOfStudy}
                    onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  />
                </div>
              )}

              {formData.currentStatus === 'professional' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Domain</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-primary-600 hover:text-primary-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

