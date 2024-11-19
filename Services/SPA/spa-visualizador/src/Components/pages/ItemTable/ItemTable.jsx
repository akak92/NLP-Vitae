import React, { useEffect, useState } from 'react';

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
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={headerStyle}>File ID</th>
            <th style={headerStyle}>File Base64 ID</th>
            <th style={headerStyle}>Name</th>
            <th style={headerStyle}>Creation Date</th>
            <th style={headerStyle}>Picture ID</th>
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
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={emptyStyle}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Estilos básicos para la tabla
const headerStyle = {
  backgroundColor: '#f4f4f4',
  padding: '10px',
  textAlign: 'left',
  border: '1px solid #ddd',
};

const rowStyle = {
  borderBottom: '1px solid #ddd',
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

export default ItemTable;
