import { useAuth } from '../providers/AuthContext';

export const useReservaService = () => {
  const { axiosInstance } = useAuth();

  // Obtener reservas
  const getReservas = async (filters = {}, page = 1, isAdmin = false) => {
    const endpoint = isAdmin ? '/admin/reservations' : '/reservations';
    const params = {
      page,
      ...filters
    };
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
  };

  // Crear nueva reserva
  const crearReserva = async (spaceId, fechaDesde, horaDesde, fechaHasta, horaHasta) => {
    try {
      const response = await axiosInstance.post('/reservations', {
        space_id: spaceId,
        start_time: `${fechaDesde}T${horaDesde}:00`,
        end_time: `${fechaHasta}T${horaHasta}:00`
      });
      return response.data;
    } catch (error) {

      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        throw new Error(errorMessages.join('\n'));
      }
      throw new Error(error.response?.data?.message || 'Error al crear la reserva');
    }
  };

  // Cancelar reserva
  const cancelarReserva = async (id) => {
    const response = await axiosInstance.put(`/reservations/${id}/cancel`);
    return response.data;
  };

  // Aprobar reserva (admin)
  const aprobarReserva = async (id) => {
    const response = await axiosInstance.put(`/admin/reservations/${id}/approve`);
    return response.data;
  };

  // Rechazar reserva (admin)
  const rechazarReserva = async (id) => {
    const response = await axiosInstance.put(`/admin/reservations/${id}/reject`);
    return response.data;
  };

  return {
    getReservas,
    crearReserva,
    cancelarReserva,
    aprobarReserva,
    rechazarReserva
  };
};