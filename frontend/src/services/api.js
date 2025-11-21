import config from '../../backend.config.json';

const API_URL = `http://localhost:${config.BACKEND_PORT}`;

const apiCall = async (endpoint, method = 'GET', body = null, requiresAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// Auth
export const register = (email, password, name) =>
  apiCall('/user/auth/register', 'POST', { email, password, name });

export const login = (email, password) =>
  apiCall('/user/auth/login', 'POST', { email, password });

export const logout = () =>
  apiCall('/user/auth/logout', 'POST', null, true);

// Listings
export const getAllListings = () => apiCall('/listings');

export const getListing = (id) => apiCall(`/listings/${id}`);

export const createListing = (data) =>
  apiCall('/listings/new', 'POST', data, true);

export const updateListing = (id, data) =>
  apiCall(`/listings/${id}`, 'PUT', data, true);

export const deleteListing = (id) =>
  apiCall(`/listings/${id}`, 'DELETE', null, true);

export const publishListing = (id, availability) =>
  apiCall(`/listings/publish/${id}`, 'PUT', { availability }, true);

export const unpublishListing = (id) =>
  apiCall(`/listings/unpublish/${id}`, 'PUT', null, true);

export const leaveReview = (listingId, bookingId, review) =>
  apiCall(`/listings/${listingId}/review/${bookingId}`, 'PUT', { review }, true);

// Bookings
export const getAllBookings = () =>
  apiCall('/bookings', 'GET', null, true);

export const makeBooking = (listingId, dateRange) =>
  apiCall(`/bookings/new/${listingId}`, 'POST', { dateRange }, true);

export const deleteBooking = (id) =>
  apiCall(`/bookings/${id}`, 'DELETE', null, true);

export const acceptBooking = (id) =>
  apiCall(`/bookings/accept/${id}`, 'PUT', null, true);

export const declineBooking = (id) =>
  apiCall(`/bookings/decline/${id}`, 'PUT', null, true);