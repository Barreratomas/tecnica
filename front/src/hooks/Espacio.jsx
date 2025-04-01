import { useAuth } from '../providers/AuthContext';

export const useEspacioService = () => {
  const { axiosInstance } = useAuth();

  // Obtener todos los espacios
  const getEspacios = async (filtro = '', page = 1, perPage = 10) => {
    const response = await axiosInstance.get('/spaces', {
      params: { 
        search: filtro,
        page,
        per_page: perPage
      }
    });
    return response.data;
  };

  // Crear un nuevo espacio
  const crearEspacio = async (espacioData) => {
    const response = await axiosInstance.post('/spaces', espacioData);
    return response.data;
  };

  // Actualizar un espacio existente
  const actualizarEspacio = async (id, espacioData) => {
    const response = await axiosInstance.put(`/spaces/${id}`, espacioData);
    return response.data;
  };

  // Eliminar un espacio
  const deleteEspacio = async (id) => {
    await axiosInstance.delete(`/spaces/${id}`);
    return id;
  };

  // Obtener un espacio por ID
  const getEspacioById = async (id) => {
    const response = await axiosInstance.get(`/spaces/${id}`);
    return response.data;
  };

  return { 
    getEspacios, 
    crearEspacio, 
    actualizarEspacio, 
    deleteEspacio,
    getEspacioById
  };
};