import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ItemDetail = () => {
  const { file_id } = useParams();
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/file/filter/id/${file_id}`);
        if (!response.ok) {
          throw new Error("Error al cargar los datos del documento");
        }
        const result = await response.json();
        setDocumentData(result.data);  // Accedemos a 'data' que es el objeto con los datos reales
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [file_id]);

  if (loading) return <p style={loadingErrorStyle}>Cargando...</p>;
  if (error) return <p style={loadingErrorStyle}>{error}</p>;

  if (!documentData) {
    return <p>No se encontraron datos para este documento.</p>;
  }

  const { file_base64_id, name, creation_date, results, picture_id } = documentData;

  const validResults = Array.isArray(results) ? results : [];

  // NER Results (Asegurarse de que no haya duplicados y filtrar resultados vacíos)
  const nerResults = validResults.flatMap(result => result.data || []).filter(entity => entity.word && entity.entity_group);

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Detalles del Documento</h2>
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h3 style={cardTitleStyle}>
            <a href={`/download/${file_id}`} style={linkStyle}>
              {name || 'Sin nombre'} 📥
            </a>
          </h3>
          <p style={cardSubTitleStyle}><strong>ID:</strong> {file_id}</p>
          <p style={cardSubTitleStyle}><strong>base64 ID:</strong> {file_base64_id || 'No disponible'}</p>
          <p style={cardSubTitleStyle}><strong>Fecha de Creación:</strong> {creation_date || 'No disponible'}</p>
        </div>

        {/* Sección de NER */}
        <div style={cardBodyStyle}>
          {nerResults.length > 0 ? (
            <div>
              <h4 style={nerResultsTitleStyle}>NER</h4>
              <ul style={nerListStyle}>
                {nerResults.map((entity, index) => (
                  <li key={index} style={nerListItemStyle}>
                    <strong>Entidad:</strong> {entity.word} <br />
                    <strong>Grupo:</strong> {entity.entity_group} <br />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={loadingErrorStyle}>No hay resultados de NER disponibles.</p>
          )}
        </div>

        {/* Imagen */}
        <div style={cardBodyStyle}>
          {picture_id ? (
            <div style={imageContainerStyle}>
              <img
                src={`/api/images/${picture_id}`}
                alt={`Imagen de Perfil ${name}`}
                style={profilePictureStyle}
              />
            </div>
          ) : (
            <p>No hay imagen disponible.</p>
          )}
        </div>

        {/* Mostrar resultados adicionales */}
        {validResults.length > 0 ? (
          validResults.map((result, index) => (
            <div key={index} style={resultStyle}>
              <h4 style={resultTitleStyle}>{result.process || 'No Procesado'}</h4>
              <pre style={resultPreStyle}>{JSON.stringify(result.data, null, 2)}</pre>
              <p style={resultParagraphStyle}>
                <strong>Duración:</strong> {result.duration ? result.duration.toFixed(2) : 'N/A'} segundos
              </p>
            </div>
          ))
        ) : (
          <p style={loadingErrorStyle}>No hay resultados para mostrar.</p>
        )}
      </div>
    </div>
  );
};

// Estilos en formato objeto
const containerStyle = {
  maxWidth: '800px',
  margin: '20px auto',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const headingStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '16px',
  backgroundColor: '#f9f9f9',
};

const cardHeaderStyle = {
  marginBottom: '16px',
};

const cardTitleStyle = {
  margin: '0',
  color: '#333',
  fontSize: '20px',
};

const cardSubTitleStyle = {
  fontSize: '14px',
  color: '#555',
};

const cardBodyStyle = {
  padding: '16px',
};

const imageContainerStyle = {
  textAlign: 'center',
  marginBottom: '16px',
};

const profilePictureStyle = {
  maxWidth: '100%',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

const resultStyle = {
  marginTop: '16px',
  padding: '16px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  backgroundColor: '#fff',
};

const resultTitleStyle = {
  fontSize: '18px',
  marginBottom: '8px',
  color: '#333',
};

const resultPreStyle = {
  backgroundColor: '#f4f4f4',
  padding: '10px',
  borderRadius: '4px',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  fontSize: '14px',
};

const resultParagraphStyle = {
  fontSize: '14px',
  color: '#555',
  marginTop: '8px',
};

const loadingErrorStyle = {
  textAlign: 'center',
  fontSize: '16px',
  color: '#555',
};

const nerResultsTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '12px',
};

const nerListStyle = {
  paddingLeft: '20px',
  listStyleType: 'disc',
};

const nerListItemStyle = {
  marginBottom: '10px',
  backgroundColor: '#f9f9f9',
  padding: '10px',
  borderRadius: '4px',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
};

const linkStyle = {
  textDecoration: 'none',
  color: '#007BFF',
  fontWeight: 'bold',
};

export default ItemDetail;
