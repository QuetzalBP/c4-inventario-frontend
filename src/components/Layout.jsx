// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '250px',
        padding: '20px',
        minHeight: '100vh',
        overflowX: 'auto'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;