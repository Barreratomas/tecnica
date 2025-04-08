import React from "react";
import DataTable from "react-data-table-component";
import styles from "../css/IndexEspacios.module.css";
function Table({ rol,pagination,handlePageChange, campos = [], data = [], acciones = [] }) {

  const columnas = campos.map((campo) => {
    if (campo === "actions") {
      return {
        name: "Actions",
        cell: (row) => (
          <div
            style={{ display: "flex", gap: "10px" }}
            className={styles.actionButtons}
          >
            {acciones.map((accion, index) => {
                if (rol !== "admin" && !(accion.name.toLowerCase() === "reservar" || accion.name.toLowerCase() === "cancelar")  ) {
                  
                  return null;
                }
                if (accion.name.toLowerCase() === "cancelar" && row.id_user_reserva !== row.id_user) {
                  console.log("aeaaaaaaaa")
                  return null;
                }
                if (row.status !== "pending") {
                  return null;

                }
                return(
                    <button
                    className={
                      accion.name.toLowerCase() === "actualizar"
                        ? `${styles.button} ${styles.buttonPrimary}`
                        : accion.name.toLowerCase() === "eliminar" ||
                          accion.name.toLowerCase() === "rechazar"
                        ? `${styles.button} ${styles.buttonDanger}`
                        : accion.name.toLowerCase() === "reservar" ||
                          accion.name.toLowerCase() === "aprobar"
                        ? ` ${styles.button} ${styles.buttonSuccess}`
                        : accion.name.toLowerCase() === "cancelar"
                        ? `${styles.button} ${styles.buttonWarning}`
                        : styles.button
                    }
                    key={index}
                    onClick={() => accion.action(row.id)}
                  >
                    {accion.name}
                  </button>
                )
                
   
            })}
          </div>
        ),
      };
    }

    return {
      name: campo.charAt(0).toUpperCase() + campo.slice(1),
      selector: (row) => {
        // Formatea valores especiales
        if (campo === "available") return row[campo] ? "Sí" : "No";
        return row[campo];
      },
      sortable: true,
    };
  });


  return (
    <div>
      <DataTable 
        key={`espacios-table-${pagination.currentPage}`}
        columns={columnas} data={data}
        pagination
        paginationServer
        paginationTotalRows={pagination.totalItems || 0}
        paginationDefaultPage={pagination.currentPage} 
        onChangePage={handlePageChange}
        paginationPerPage={pagination.perPage}
        highlightOnHover
        responsive
        noDataComponent="No hay datos."
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

      ></DataTable>
    </div>
  );
}

export default Table;
