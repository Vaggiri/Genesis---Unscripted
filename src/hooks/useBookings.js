import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { getSupabaseClient } from '../services/supabaseClient';

export function useBookings(options = {}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getInnovationBookings();
      setBookings(res?.bookings || []);
      setError(null);
    } catch (err) {
      console.warn('Failed to load bookings:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    fetchBookings();

    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Supabase Realtime channel subscription for live sync between student & faculty devices
    const channel = supabase
      .channel('realtime:facility_bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'facility_bookings' },
        (payload) => {
          console.log('⚡ Realtime facility booking event received:', payload.eventType);
          fetchBookings();

          // Audio notification if available
          if (optionsRef.current?.onRealtimeEvent) {
            optionsRef.current.onRealtimeEvent(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  const createBooking = async (bookingData) => {
    const result = await api.createBooking(bookingData);
    await fetchBookings();
    return result;
  };

  const updateBookingStatus = async (id, status) => {
    const result = await api.updateBookingStatus(id, status);
    await fetchBookings();
    return result;
  };

  const checkIn = async (id) => {
    const result = await api.checkInBooking(id);
    await fetchBookings();
    return result;
  };

  return {
    bookings,
    loading,
    error,
    refresh: fetchBookings,
    createBooking,
    updateBookingStatus,
    checkIn
  };
}
