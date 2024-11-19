import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <p style={footerTextStyle}>© 2024 NLP Vitae. All rights reserved.</p>
    </footer>
  );
};

const footerStyle = {
  position: 'fixed',       // Fija el footer en la parte inferior
  bottom: '0',             // Alinea el footer a la parte inferior
  left: '0',               // Alinea el footer a la izquierda
  width: '100%',           // Asegura que el footer ocupe todo el ancho de la pantalla
  backgroundColor: '#1C1C1C', // Fondo oscuro
  color: '#B0B0B0',        // Texto suave
  textAlign: 'center',     // Centra el texto
  padding: '20px 0',       // Espaciado interno
  zIndex: 1000,            // Asegura que el footer esté sobre otros elementos
};

const footerTextStyle = {
  margin: 0,              // Elimina el margen
  fontSize: '14px',       // Tamaño de fuente
};

export default Footer;

