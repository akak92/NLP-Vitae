import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ItemTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener los datos del backend
  const fetchData = async () => {
    try {
      const response = await fetch('/file/all');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result.data); // Accede a la clave 'data'
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Llamada inicial para obtener los datos
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={tableContainerStyle}>
      <h3>Processed Documents</h3>
      {/* Contenedor con scroll */}
      <div style={scrollContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerStyle}>File ID</th>
              <th style={headerStyle}>File Base64 ID</th>
              <th style={headerStyle}>Name</th>
              <th style={headerStyle}>Creation Date</th>
              <th style={headerStyle}>Picture ID</th>
              <th style={headerStyle}>Results</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} style={rowStyle}>
                  <td style={cellStyle}>{item.file_id}</td>
                  <td style={cellStyle}>{item.file_base64_id}</td>
                  <td style={cellStyle}>{item.name}</td>
                  <td style={cellStyle}>{item.creation_date}</td>
                  <td style={cellStyle}>{item.picture_id}</td>
                  <td style={cellStyle}>
                    <Link to={`/file/${item.file_id}`} style={linkStyle}>
                      View info
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={emptyStyle}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Estilos
const tableContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  height: '100vh',
  padding: '10px',
  boxSizing: 'border-box',
};

const scrollContainerStyle = {
  maxHeight: '400px',
  overflow: 'auto',
  border: '1px solid #ddd',
  marginTop: '10px',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const headerStyle = {
  backgroundColor: '#000000',
  color: '#FFFFFF',
  padding: '10px',
  textAlign: 'left',
  border: '1px solid #ddd',
  fontFamily: 'Roboto, sans-serif',
  position: 'sticky', // Hace que el encabezado se mantenga fijo
  top: 0, // Fija la posición superior del encabezado
  zIndex: 1, // Asegura que el encabezado esté por encima del contenido
};

const rowStyle = {
  borderBottom: '1px solid #ddd',
  fontFamily: 'Roboto, sans-serif',
};

const cellStyle = {
  padding: '10px',
  textAlign: 'left',
};

const emptyStyle = {
  padding: '10px',
  textAlign: 'center',
  fontStyle: 'italic',
};

const linkStyle = {
  color: '#007BFF',
  textDecoration: 'none',
  cursor: 'pointer',
};

export default ItemTable;

