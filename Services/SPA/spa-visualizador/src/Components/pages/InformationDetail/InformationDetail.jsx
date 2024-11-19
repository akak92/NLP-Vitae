import React, { useEffect, useState } from 'react';

const InformationDetail = () => {
  const [ocrVersion, setOcrVersion] = useState(null);
  const [nerModelInfo, setNerModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener la versión de Tesseract
  const fetchOcrVersion = async () => {
    try {
      const response = await fetch('/tversion');
      const data = await response.json();
      setOcrVersion(data.message);
    } catch (err) {
      setError('Error fetching OCR version');
    }
  };

  // Función para obtener la información del modelo NER
  const fetchNerModelInfo = async () => {
    try {
      const response = await fetch('/model');
      const data = await response.json();
      setNerModelInfo(data.message); // Guardamos el objeto directamente
    } catch (err) {
      setError('Error fetching NER model info');
    }
  };

  useEffect(() => {
    fetchOcrVersion();
    fetchNerModelInfo();
    setLoading(false);
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>OCR</h2>
        <p><strong>Tesseract version:</strong> {ocrVersion}</p>
      </div>
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>NER</h2>
        {/* Mostrar cada elemento de nerModelInfo */}
        {nerModelInfo && (
          <ul style={listStyle}>
            {Object.entries(nerModelInfo).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value.toString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const containerStyle = {
    display: 'flex',
    justifyContent: 'center', // Centrar horizontalmente
    alignItems: 'center', // Centrar verticalmente
    flexDirection: 'column',
    height: '100vh', // Altura completa de la pantalla
    backgroundColor: '#f4f4f9',
    padding: '20px',
  };
  
const cardStyle = {
backgroundColor: '#fff',
padding: '20px',
marginBottom: '20px',
boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
borderRadius: '8px',
width: '100%',
maxWidth: '600px', // Limita el tamaño de la tarjeta
textAlign: 'left', // Alinear el texto a la izquierda
};

const sectionTitleStyle = {
  textAlign: 'center',
  fontSize: '1.5em',
  marginBottom: '10px',
};

const listStyle = {
  listStyleType: 'none',
  padding: 0,
  margin: 0,
};

export default InformationDetail;

