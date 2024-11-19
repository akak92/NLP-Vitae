import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const NavBar = () => {
  return (
    <nav style={navbarStyle}>
      <div style={logoContainerStyle}>
        <Link to="/" style={linkStyle}>NLP Vitae</Link>
      </div>
      <ul style={navListStyle}>
        <Link to="/" style={linkStyle}>All Documents</Link>
        <Link to="/info" style={linkStyle}>More Info</Link>
      </ul>
    </nav>
  );
};

const navbarStyle = {
  backgroundColor: '#1C1C1C', // Fondo oscuro
  display: 'flex',
  justifyContent: 'space-between', // Esto alinea el logo a la izquierda y las secciones al centro
  alignItems: 'center',
  padding: '10px 20px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};

const logoContainerStyle = {
  flex: '0 1 auto', // Esto asegura que el logo no ocupe espacio extra
};

const logoStyle = {
  height: '40px', // Ajusta el tamaño de tu logo
  width: 'auto',
  fontSize: '18px',
  fontWeight: 'bold',
  transition: 'color 0.3s',
  padding: '0 15px', // Espaciado entre enlaces
  color: '#FFFFFF', // Texto blanco

};

const navListStyle = {
  listStyle: 'none',
  display: 'flex',
  justifyContent: 'center', // Centra los enlaces de navegación
  margin: 0,
  padding: 0,
  flex: '1', // Esto hace que la lista ocupe el espacio restante, centrando los enlaces
};

const linkStyle = {
  color: '#FFFFFF', // Texto blanco
  textDecoration: 'none',
  fontSize: '18px',
  fontWeight: 'bold',
  transition: 'color 0.3s',
  padding: '0 15px', // Espaciado entre enlaces
};

export default NavBar;
