/**
 * Google Calendar provider — listEvents(), createEvent(), updateEvent(), deleteEvent().
 * Uses the Google Calendar REST API v3 with OAuth2 access tokens.
 */

import { httpClient } from '../../core/http.js';
import { wrapProviderError, ConfigurationError } from '../../core/errors.js';

const BASE = 'https://www.googleapis.com/calendar/v3';

function client(accessToken) {
  return httpClient({ timeout: 15_000, headers: { Authorization: `Bearer ${accessToken}` } });
}

/**
 * List calendars for the authenticated user.
 */
export async function listCalendars({ signal } = {}, accessToken) {
  if (!accessToken) throw new ConfigurationError('[calendar/google] Missing accessToken', { provider: 'calendar-google' });
  try {
    const { data } = await client(accessToken).get(`${BASE}/users/me/calendarList`, { signal });
    return { calendars: data.items };
  } catch (err) {
    throw wrapProviderError(err, 'calendar-google');
  }
}

/**
 * List events from a calendar.
 * @param {{ calendarId?: string, timeMin?: string, timeMax?: string, maxResults?: number, q?: string, orderBy?: string, signal?: AbortSignal }} params
 */
export async function listEvents({ calendarId = 'primary', timeMin, timeMax, maxResults = 50, q, orderBy = 'startTime', singleEvents = true, signal } = {}, accessToken) {
  if (!accessToken) throw new ConfigurationError('[calendar/google] Missing accessToken', { provider: 'calendar-google' });
  try {
    const { data } = await client(accessToken).get(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events`, {
      params: { timeMin, timeMax, maxResults, q, orderBy, singleEvents },
      signal,
    });
    return { events: data.items, nextPageToken: data.nextPageToken, summary: data.summary };
  } catch (err) {
    throw wrapProviderError(err, 'calendar-google');
  }
}

/**
 * Create a calendar event.
 * @param {{ calendarId?: string, summary: string, description?: string, start: { dateTime: string, timeZone?: string }, end: { dateTime: string, timeZone?: string }, attendees?: Array<{ email: string }>, location?: string, signal?: AbortSignal }} params
 */
export async function createEvent({ calendarId = 'primary', summary, description, start, end, attendees, location, recurrence, signal } = {}, accessToken) {
  if (!accessToken) throw new ConfigurationError('[calendar/google] Missing accessToken', { provider: 'calendar-google' });
  try {
    const body = { summary, description, start, end, attendees, location, ...(recurrence && { recurrence }) };
    const { data } = await client(accessToken).post(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events`, body, { signal });
    return { id: data.id, htmlLink: data.htmlLink, status: data.status };
  } catch (err) {
    throw wrapProviderError(err, 'calendar-google');
  }
}

/**
 * Update a calendar event.
 */
export async function updateEvent({ calendarId = 'primary', eventId, summary, description, start, end, attendees, location, signal } = {}, accessToken) {
  if (!accessToken) throw new ConfigurationError('[calendar/google] Missing accessToken', { provider: 'calendar-google' });
  if (!eventId) throw new ConfigurationError('[calendar/google] Missing eventId', { provider: 'calendar-google' });
  try {
    const body = { summary, description, start, end, attendees, location };
    const { data } = await client(accessToken).put(
      `${BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      body,
      { signal }
    );
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'calendar-google');
  }
}

/**
 * Delete a calendar event.
 */
export async function deleteEvent({ calendarId = 'primary', eventId, signal } = {}, accessToken) {
  if (!accessToken) throw new ConfigurationError('[calendar/google] Missing accessToken', { provider: 'calendar-google' });
  if (!eventId) throw new ConfigurationError('[calendar/google] Missing eventId', { provider: 'calendar-google' });
  try {
    await client(accessToken).delete(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, { signal });
    return { deleted: true, eventId };
  } catch (err) {
    throw wrapProviderError(err, 'calendar-google');
  }
}

/**
 * Get a specific event.
 */
export async function getEvent({ calendarId = 'primary', eventId, signal } = {}, accessToken) {
  if (!accessToken) throw new ConfigurationError('[calendar/google] Missing accessToken', { provider: 'calendar-google' });
  try {
    const { data } = await client(accessToken).get(
      `${BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      { signal }
    );
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'calendar-google');
  }
}

/**
 * Free/busy query — find available slots.
 */
export async function freeBusy({ calendarIds, timeMin, timeMax, signal } = {}, accessToken) {
  if (!accessToken) throw new ConfigurationError('[calendar/google] Missing accessToken', { provider: 'calendar-google' });
  try {
    const { data } = await client(accessToken).post(`${BASE}/freeBusy`, {
      timeMin, timeMax,
      items: calendarIds.map((id) => ({ id })),
    }, { signal });
    return { calendars: data.calendars };
  } catch (err) {
    throw wrapProviderError(err, 'calendar-google');
  }
}
