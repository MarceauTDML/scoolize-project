const API_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const request = async (endpoint, method = "GET", body = null) => {
  const config = {
    method,
    headers: getHeaders(),
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Une erreur est survenue");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const login = (credentials) => {
  return request("/auth/login", "POST", credentials);
};

export const register = (userData) => {
  return request("/auth/register", "POST", userData);
};

export const getSchools = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return request(`/schools?${queryString}`, "GET");
};

export const getSchoolById = (id) => {
  return request(`/schools/${id}`, "GET");
};

export const getAllSchoolLocations = () => {
  return request("/schools/locations", "GET");
};

export const applyToSchool = (schoolId) => {
  return request("/applications", "POST", { school_id: schoolId });
};

export const getStudentApplications = () => {
  return request("/applications/my-student-applications", "GET");
};

export const getMyApplications = () => {
  return request("/applications/my-applications", "GET");
};

export const updateApplicationStatus = (applicationId, status) => {
  return request(`/applications/${applicationId}/status`, "PUT", { status });
};

export const getPendingSchools = () => {
  return request("/admin/pending", "GET");
};

export const validateSchool = (id) => {
  return request(`/admin/validate/${id}`, "PUT");
};

export const rejectSchool = (id) => {
  return request(`/admin/reject/${id}`, "DELETE");
};

export const toggleFavorite = (schoolId) => {
  return request("/favorites/toggle", "POST", { school_id: schoolId });
};

export const getFavorites = () => {
  return request("/favorites", "GET");
};

export const getFavoriteIds = () => {
  return request("/favorites/ids", "GET");
};

export const createNews = (newsData) => {
  return request("/news", "POST", newsData);
};

export const deleteNews = (newsId) => {
  return request(`/news/${newsId}`, "DELETE");
};

export const getSchoolNews = (schoolId) => {
  return request(`/news/school/${schoolId}`, "GET");
};

export const registerForEvent = (eventId) => {
  return request(`/news/${eventId}/register`, "POST");
};

export const getEventRegistrations = (eventId) => {
  return request(`/news/${eventId}/registrations`, "GET");
};

export const updateEventRegistration = (regId, status) => {
  return request(`/news/registration/${regId}`, "PUT", { status });
};

export const checkMyEventRegistrations = () => {
  return request("/news/my-registrations/check", "GET");
};

export const getMyEventRegistrations = () => {
  return request('/news/my-registrations', 'GET');
};

export const createReview = (data) => {
  return request('/reviews', 'POST', data);
};

export const getSchoolReviews = (schoolId) => {
  return request(`/reviews/school/${schoolId}`, 'GET');
};

export const checkCanReview = (schoolId) => {
  return request(`/reviews/can-review/${schoolId}`, 'GET');
};