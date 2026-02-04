import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const usersAPI = {
  getAll: (role) => api.get('/users', { params: { role } }),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  addStudent: (courseId, studentId) => api.post(`/courses/${courseId}/students/${studentId}`),
};

export const attendanceAPI = {
  mark: (data) => api.post('/attendance', data),
  getStudent: (studentId, courseId) => api.get(`/attendance/student/${studentId}`, { params: { courseId } }),
  getCourse: (courseId) => api.get(`/attendance/course/${courseId}`),
  getAll: () => api.get('/attendance/all'),
  update: (id, status) => api.put(`/attendance/${id}`, { status }),
};

export const gradesAPI = {
  create: (data) => api.post('/grades', data),
  getStudent: (studentId) => api.get(`/grades/student/${studentId}`),
  getCourse: (courseId) => api.get(`/grades/course/${courseId}`),
};

export const feesAPI = {
  create: (data) => api.post('/fees', data),
  getStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  getAll: () => api.get('/fees'),
  pay: (id) => api.put(`/fees/${id}/pay`),
};

export const eventsAPI = {
  getAll: () => api.get('/events'),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const lecturesAPI = {
  getAll: (courseId, teacherId) => api.get('/lectures', { params: { courseId, teacherId } }),
  create: (data) => api.post('/lectures', data),
  update: (id, data) => api.put(`/lectures/${id}`, data),
  delete: (id) => api.delete(`/lectures/${id}`),
};

export const assignmentsAPI = {
  getAll: (courseId) => api.get('/assignments', { params: { courseId } }),
  create: (data) => api.post('/assignments', data),
  submit: (data) => api.post('/assignments/submit', data),
  getSubmissions: (assignmentId) => api.get(`/assignments/${assignmentId}/submissions`),
  getStudentSubmissions: (studentId) => api.get(`/assignments/student/${studentId}/submissions`),
  grade: (id, marks, feedback) => api.put(`/assignments/submissions/${id}/grade`, { marks, feedback }),
};

export default api;
