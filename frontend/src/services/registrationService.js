import api from "./api";

export const getMyRegistrations = async () => {
  const res = await api.get("/registrations/my");
  return res.data.data;
};

export const registerForEvent = async (eventId) => {
  const res = await api.post(`/registrations/${eventId}`);
  return res.data;
};

export const getRegistrationQR = async (id) => {
  const res = await api.get(`/registrations/${id}/qr`);
  return res.data.data.qrImage;
};

export const downloadTicketPDFStream = async (id) => {
  const res = await api.get(`/registrations/${id}/ticket`, {
    responseType: "blob",
  });
  return res.data;
};

export const checkInAttendee = async (payload) => {
  const res = await api.post("/scanner/checkin", payload);
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get("/analytics/dashboard");
  return res.data.data;
};

export const getEventRegistrations = async (eventId) => {
  const res = await api.get(`/registrations/event/${eventId}`);
  return res.data.data;
};

export const cancelRegistration = async (registrationId) => {
  const res = await api.put(`/registrations/${registrationId}/cancel`);
  return res.data;
};
