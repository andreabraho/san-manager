/**
 * Calendar Integration Service
 *
 * Prepared for Google Calendar API integration.
 * When ready to implement:
 *   1. Create a Google Cloud project and enable the Calendar API
 *   2. Set up OAuth2 credentials (client ID + secret)
 *   3. Add VITE_GOOGLE_CLIENT_ID to frontend/.env
 *   4. Replace the stubs below with real API calls
 *
 * Docs: https://developers.google.com/calendar/api/guides/overview
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

/**
 * Initiate Google OAuth2 flow.
 * Redirects to Google consent screen; on return, exchange code for token.
 */
export const connectGoogleCalendar = () => {
  if (!GOOGLE_CLIENT_ID) {
    alert('Google Calendar integration is not configured yet.\nAdd VITE_GOOGLE_CLIENT_ID to your .env to enable it.');
    return;
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}/provider/calendar/callback`,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });
  window.location.href = `https://accounts.google.com/o/oauth2/auth?${params}`;
};

/**
 * Create a Google Calendar event for a booking.
 * @param {object} booking - populated booking document
 * @param {string} accessToken - OAuth2 access token
 */
export const syncBookingToCalendar = async (booking, accessToken) => {
  const event = {
    summary: `${booking.service?.name} — ${booking.guestInfo?.firstName || booking.client?.firstName || 'Client'}`,
    location: booking.location?.name,
    start: {
      dateTime: `${booking.date.slice(0, 10)}T${booking.startTime}:00`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: `${booking.date.slice(0, 10)}T${booking.endTime || booking.startTime}:00`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    description: `Booking ID: ${booking._id}`,
  };

  // TODO: POST https://www.googleapis.com/calendar/v3/calendars/primary/events
  console.log('[calendarIntegration] syncBookingToCalendar (stub)', event);
};

/**
 * Remove a Google Calendar event for a booking.
 * @param {string} googleEventId
 * @param {string} accessToken
 */
export const removeBookingFromCalendar = async (googleEventId, accessToken) => {
  // TODO: DELETE https://www.googleapis.com/calendar/v3/calendars/primary/events/{googleEventId}
  console.log('[calendarIntegration] removeBookingFromCalendar (stub)', googleEventId);
};
