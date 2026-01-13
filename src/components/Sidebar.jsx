// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
    } catch (error) {
      console.error("Error al decodificar token:", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Inicio" },
    { path: "/products", label: "Tabla Productos" },
    { path: "/add-product", label: "Agregar Producto" }, 
    { path: "/reports", label: "Reportes" },
    { path: "/settings", label: "Configuración" },
  ];

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      background: 'linear-gradient(180deg, #9b1b30 0%, #c22940 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Logo */}
      <div style={{ 
        padding: '24px 20px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(155, 27, 48, 0.9)'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.5rem',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
        }}>
          C4 Inventario
        </h2>
      </div>

      {/* Menú de navegación */}
      <nav style={{ 
        flex: 1, 
        padding: '20px 0', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px' 
      }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              color: isActive ? 'white' : 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid #ffcc00' : '3px solid transparent',
              transition: 'all 0.3s ease',
              margin: '0 10px',
              borderRadius: '4px'
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Información del usuario */}
      <div style={{ 
        padding: '20px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(155, 27, 48, 0.9)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '16px' 
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            border: '2px solid rgba(255, 204, 0, 0.3)'
          }}>
            👤
          </div>
          <div>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              fontWeight: '600' 
            }}>
              {user?.name || user?.username || "Usuario"}
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              color: 'rgba(255, 255, 255, 0.8)' 
            }}>
              {user?.role || "Administrador"}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;