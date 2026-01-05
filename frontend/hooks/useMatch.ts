import { useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

export const useMatch = () => {
  const [loading, setLoading] = useState(false);
  const [interviewers, setInterviewers] = useState<User[]>([]);

  const findInterviewers = async (subject: string, radius: number, location: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      const response = await api.get('/match/interviewers', {
        params: {
          subject,
          radius,
          lat: location.lat,
          lng: location.lng,
        },
      });
      setInterviewers(response.data.interviewers);
      return response.data.interviewers;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to find interviewers');
    } finally {
      setLoading(false);
    }
  };

  return { findInterviewers, interviewers, loading };
};

