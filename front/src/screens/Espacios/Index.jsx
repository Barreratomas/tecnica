import { useEffect, useState } from "react";
import { useEspacioService } from "../../hooks/Espacio";
import CrearReserva from "../Reservas/CrearReserva";
import CrearEspacio from "./CrearEspacio";
import ActualizarEspacio from "./ActualizarEspacio";
import FiltroEspacios from "./FiltroEspacio";
import DataTable from 'react-data-table-component';
import styles from '../../css/IndexEspacios.module.css';

const IndexEspacios = () => {
  const { getEspacios, deleteEspacio } = useEspacioService();
  const [espacios, setEspacios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedEspacioId, setSelectedEspacioId] = useState(null);
  const [selectedEspacioName, setSelectedEspacioName] = useState("");
  const [usuarioRol, setUsuarioRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, perPage: 10 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEspacios();
    const rol = localStorage.getItem('role');
    setUsuarioRol(rol);
  }, [pagination.currentPage, searchTerm]);

  const fetchEspacios = async () => {
    setLoading(true);
    try {
      const data = await getEspacios(searchTerm, pagination.currentPage, pagination.perPage);
      setEspacios(data.spaces);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(data.pagination.total / pagination.perPage),
        totalItems: data.pagination.total 
      }));
    } catch (error) {
      setMensaje("Error al cargar espacios");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReserva = (id, name) => {
    setSelectedEspacioId(id);
    setSelectedEspacioName(name);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este espacio?")) {
      try {
        await deleteEspacio(id);
        fetchEspacios();
      } catch (error) {
        setMensaje("Error al eliminar el espacio");
        console.error(error);
      }
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };
  
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setPagination(prev => ({ ...prev, currentPage: 1 })); 
  };
  
  const columns = [
    {
      name: 'Nombre',
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'Descripción',
      selector: (row) => row.description,
      sortable: true,
    },
    {
      name: 'Capacidad',
      selector: (row) => row.capacity,
      sortable: true,
    },
    {
      name: 'Disponible',
      selector: (row) => (row.available === 1 ? "Sí" : "No"),
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <div className={styles.actionButtons}>
          {usuarioRol === "admin" && (
            <>
              <button 
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={() => {
                  setSelectedEspacioId(row.id);
                  setIsUpdateModalOpen(true);
                }}
              >
                Actualizar
              </button>
              <button 
                className={`${styles.button} ${styles.buttonDanger}`}
                onClick={() => handleDelete(row.id)}
              >
                Eliminar
              </button>
            </>
          )}
          {row.available === 1 && (
            <button 
              className={`${styles.button} ${styles.buttonSuccess}`}
              onClick={() => handleReserva(row.id, row.name)}
            >
              Reservar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Espacios Disponibles</h1>
        {usuarioRol === "admin" && (
          <button 
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Crear Nuevo Espacio
          </button>
        )}
      </div>

      <FiltroEspacios onFiltrar={handleSearch} />

      {mensaje && <div className={`${styles.message} ${styles.messageError}`}>{mensaje}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : (
        <div className={styles.tableContainer}>
          <DataTable
            key={`espacios-table-${searchTerm}-${pagination.currentPage}`}

        columns={columns}
        data={espacios}
        pagination
        paginationServer
        paginationTotalRows={pagination.totalItems || 0}
        paginationDefaultPage={pagination.currentPage} 
        onChangePage={handlePageChange}
        paginationPerPage={pagination.perPage}
        highlightOnHover
        responsive
        noDataComponent="No hay espacios disponibles."
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: '600',
                  fontSize: '1rem',
                },
              },
              cells: {
                style: {
                  padding: '1rem',
                },
              },
              rows: {
                style: {
                  '&:not(:last-of-type)': {
                    borderBottom: '1px solid #eee',
                  },
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                },
              },
            }}
          />
        </div>
      )}

      {/* Modal de creación de espacio */}
      <CrearEspacio 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEspacioCreado={fetchEspacios}
      />

      {/* Modal de actualización de espacio */}
      <ActualizarEspacio
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        espacioId={selectedEspacioId}
        onEspacioActualizado={fetchEspacios}
      />

      {/* Modal de reserva */}
      {isModalOpen && selectedEspacioId && (
        <CrearReserva
          espacioId={selectedEspacioId}
          espacioName={selectedEspacioName}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default IndexEspacios;