-- =========================================================================
-- Amrita Yukti — 005_realtime.sql: Enable Realtime for Facility Bookings
-- Idempotent: adds facility_bookings to supabase_realtime publication
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'facility_bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.facility_bookings;
  END IF;
END $$;
