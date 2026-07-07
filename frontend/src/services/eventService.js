import api from "./api";

export const getEvents = async () => {
  const res = await api.get("/events");
  return res.data.data;
};

export const getEventById = async (id) => {
  const res = await api.get(`/events/${id}`);
  return res.data.data;
};

export const createEvent = async (eventData) => {
  const res = await api.post("/events", eventData);
  return res.data;
};

export const getOrganizerEvents = async () => {
  const res = await api.get("/events/organizer/my");
  return res.data.data;
};

export const updateEvent = async (id, eventData) => {
  const res = await api.put(`/events/${id}`, eventData);
  return res.data.data;
};
