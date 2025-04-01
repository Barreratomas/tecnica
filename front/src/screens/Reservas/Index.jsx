import { useEffect, useState } from "react";
import { useReservaService } from "../../hooks/Reserva";
import DataTable from 'react-data-table-component';
import FiltroReservas from "./FiltroReservas";
import styles from '../../css/IndexReservas.module.css';


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
  const [backendUser, setBackendUser] = useState(null);

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
      
      const formattedReservations = (data.reservations || []).map(reserva => ({
        ...reserva,
        id_reserva: `RES-${reserva.id.toString().padStart(4, '0')}`,
        user_id: reserva.user_id || data.user_id,
        user: reserva.user || {
          name: data.user?.username || 'Usuario no disponible',
          id: data.user_id
        }
      }));

      setReservas(formattedReservations);
      setBackendUser({
        id: data.user_id,
        username: data.user?.username,
        role: data.user?.role
      });
      
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

  const formatUsername = (user) => {
    if (!user) return 'N/A';
    if (typeof user === 'string') return user;
    return user.name || user.username || 'Usuario no disponible';
  };

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#3498db',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 'bold',
      },
    },
    headCells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    cells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    rows: {
      style: {
        minHeight: '72px',
        '&:not(:last-of-type)': {
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: '#f0f0f0',
        },
        '&:hover': {
          backgroundColor: '#f8f9fa',
        },
      },
    },
    pagination: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: '#f0f0f0',
      },
    },
  };

  const columns = [
    {
      name: 'ID Reserva',
      selector: row => row.id_reserva || `RES-${row.id.toString().padStart(4, '0')}`,
      sortable: true,
    },
    {
      name: 'Espacio',
      selector: row => row.space?.name || 'N/A',
      sortable: true,
    },
    {
      name: 'Usuario',
      selector: row => formatUsername(row.user),
      sortable: true,
      omit: usuarioRol !== 'admin'
    },
    {
      name: 'Fecha Inicio',
      selector: row => new Date(row.start_time).toLocaleString(),
      sortable: true,
    },
    {
      name: 'Fecha Fin',
      selector: row => new Date(row.end_time).toLocaleString(),
      sortable: true,
    },
    {
      name: 'Estado',
      selector: row => {
        switch(row.status) {
          case 'pending': return 'Pendiente';
          case 'approved': return 'Aprobada';
          case 'rejected': return 'Rechazada';
          case 'cancelled': return 'Cancelada';
          default: return row.status;
        }
      },
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: row => {
        const esAdmin = usuarioRol === 'admin';
        const esMiReserva = row.user_id === (backendUser?.id || backendUser?.user_id);
        const estaPendiente = row.status === 'pending';

        return (
          <div className={styles.actionButtons}>
            {esAdmin && estaPendiente && (
              <>
                <button 
                  className={`${styles.button} ${styles.buttonSuccess}`}
                  onClick={() => handleApprove(row.id)}
                >
                  Aprobar
                </button>
                <button 
                  className={`${styles.button} ${styles.buttonDanger}`}
                  onClick={() => handleReject(row.id)}
                >
                  Rechazar
                </button>
              </>
            )}

            {esMiReserva && estaPendiente && (
              <button 
                className={`${styles.button} ${styles.buttonWarning}`}
                onClick={() => handleCancel(row.id)}
              >
                Cancelar
              </button>
            )}

            {(!esAdmin && !esMiReserva) && (
              <span className={styles.statusText}>
                {row.status === 'pending' ? 'Pendiente' : 
                 row.status === 'approved' ? 'Aprobada' : 
                 row.status === 'rejected' ? 'Rechazada' : 'Cancelada'}
              </span>
            )}
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];

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
          <DataTable
            columns={columns}
            data={reservas}
            pagination
            paginationServer
            paginationTotalRows={pagination.total}
            paginationDefaultPage={pagination.currentPage}
            onChangePage={handlePageChange}
            paginationPerPage={pagination.perPage}
            paginationRowsPerPageOptions={[5, 10, 15, 20]}
            highlightOnHover
            responsive
            noDataComponent="No se encontraron reservas"
            customStyles={customStyles}
          />
        </div>
      )}
    </div>
  );
};

export default IndexReservas;