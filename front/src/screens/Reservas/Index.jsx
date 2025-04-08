import { useEffect, useState } from "react";
import { useReservaService } from "../../hooks/Reserva";
import DataTable from 'react-data-table-component';
import FiltroReservas from "./FiltroReservas";
import styles from '../../css/IndexReservas.module.css';
import Table from "../../hooks/tabla";


const IndexReservas = () => {
  const { getReservas, cancelarReserva, aprobarReserva, rechazarReserva } = useReservaService();
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ 
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1
  });
  const [filters, setFilters] = useState({});
  const [usuarioRol, setUsuarioRol] = useState('');

  useEffect(() => {
    const rol = localStorage.getItem('role');
    setUsuarioRol(rol);
    fetchReservas();
  }, [pagination.currentPage, filters]);

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const isAdmin = localStorage.getItem('role') === 'admin';
      const data = await getReservas(filters, pagination.currentPage, isAdmin);
      console.log("data", data)

      const formattedReservations = data.reservations.map((reserva) => {
        const start = new Date(reserva.start_time);
        const end = new Date(reserva.end_time);
      
        const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit' };
      
        return {
          id: reserva.id,
          space: reserva.space.name,
          start_time: `${start.toLocaleDateString([], optionsDate)} ${start.toLocaleTimeString([], optionsTime)}`,
          end_time: `${end.toLocaleDateString([], optionsDate)} ${end.toLocaleTimeString([], optionsTime)}`,
          status: reserva.status,
          user: reserva.user?.username || "Yo",
          id_user_reserva:reserva.user_id,
          id_user:data.user_id
        }

      });

      setReservas(formattedReservations);
  
      
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || formattedReservations.length,
        lastPage: data.pagination?.last_page || 1
      }));

    } catch (error) {
      setMensaje("Error al cargar reservas");
      console.error("Error al obtener reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleCancel = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres cancelar esta reserva?")) {
      try {
        await cancelarReserva(id);
        setMensaje("Reserva cancelada con éxito");
        fetchReservas();
      } catch (error) {
        setMensaje(error.response?.data?.error || "Error al cancelar la reserva");
        console.error("Error al cancelar reserva:", error);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await aprobarReserva(id);
      setMensaje("Reserva aprobada con éxito");
      fetchReservas();
    } catch (error) {
      setMensaje("Error al aprobar la reserva");
      console.error("Error al aprobar reserva:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rechazarReserva(id);
      setMensaje("Reserva rechazada con éxito");
      fetchReservas();
    } catch (error) {
      setMensaje("Error al rechazar la reserva");
      console.error("Error al rechazar reserva:", error);
    }
  };






  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {usuarioRol === 'admin' ? 'Gestión de Reservas' : 'Mis Reservas'}
        </h1>
      </div>

      <FiltroReservas onFilter={handleFilterChange}  />

      {mensaje && <div className={`${styles.message} ${mensaje.includes('Error') ? styles.messageError : ''}`}>{mensaje}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando reservas...</div>
      ) : (
        <div className={styles.tableContainer}>
          <Table
            rol={usuarioRol}
            pagination={pagination}
            handlePageChange={()=> handlePageChange}
            campos={["space","user","start_time","end_time","status","actions"]}
            data={reservas}
            acciones={[
              { name: "aprobar", action: handleApprove },
              { name: "rechazar", action: handleReject },
              { name: "cancelar", action: handleCancel },
            ]}
          ></Table>

 
        </div>
      )}
    </div>
  );
};

export default IndexReservas;