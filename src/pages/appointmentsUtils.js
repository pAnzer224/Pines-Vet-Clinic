export const getStoredAppointments = () => {
  const stored = localStorage.getItem("appointments");
  return stored ? JSON.parse(stored) : [];
};

export const storeAppointment = (appointment) => {
  const currentAppointments = getStoredAppointments();
  const updatedAppointments = [...currentAppointments, appointment];
  localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
  return updatedAppointments;
};
