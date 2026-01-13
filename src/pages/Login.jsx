// pages/Login.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import api from "../api" // 👈 IMPORTA TU INSTANCIA CONFIGURADA (ajusta la ruta según tu estructura)
export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Estado para formulario de registro
  const [registerMode, setRegisterMode] = useState(false)
  const [regUsername, setRegUsername] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPassword, setRegConfirmPassword] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regError, setRegError] = useState("")
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState("")
  
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      const res = await api.post("http://localhost:3000/api/auth/login", {
        username,
        password
      })
      
      localStorage.setItem("token", res.data.token)
      navigate("/dashboard")
    } catch (err) {
      console.error("Error de login:", err)
      setError(err.response?.data?.message || "Credenciales inválidas")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegError("")
    setRegSuccess("")
    
    // Validaciones básicas
    if (regPassword !== regConfirmPassword) {
      setRegError("Las contraseñas no coinciden")
      return
    }
    
    if (regPassword.length < 6) {
      setRegError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    
    setRegLoading(true)
    
    try {
      // Aquí iría la llamada a la API de registro
      // Simulando registro exitoso
      setTimeout(() => {
        setRegSuccess("Registro exitoso. Ahora puedes iniciar sesión.")
        setRegUsername("")
        setRegPassword("")
        setRegConfirmPassword("")
        setRegEmail("")
        setRegLoading(false)
        setRegisterMode(false)
      }, 1500)
      
      // En producción sería algo como:
      // const res = await axios.post("http://localhost:3000/api/auth/register", {
      //   username: regUsername,
      //   password: regPassword,
      //   email: regEmail
      // })
      
    } catch (err) {
      console.error("Error de registro:", err)
      setRegError(err.response?.data?.message || "Error en el registro")
      setRegLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="header-section">
        <div className="logo-section">
          <div className="logo-edomex">
            <div className="logo-circle">
              <span className="logo-text">EM</span>
            </div>
          </div>
          <h1 className="main-title">C4 Control de inventario</h1>
        </div>
        <h2 className="subtitle">Gobierno Municipal de Chimalhuacán</h2>
      </div>
      
      <div className="forms-container">
        <div className={`login-form ${registerMode ? 'form-inactive' : ''}`}>
          <h3>Iniciar Sesión</h3>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button type="submit" disabled={loading} className="btn-login">
              {loading ? "Entrando..." : "Entrar al sistema"}
            </button>
          </form>
          
          {error && <p className="error-message">{error}</p>}
          
          
        </div>
        
        <div className={`register-form ${!registerMode ? 'form-inactive' : ''}`}>
          <h3>Crear Cuenta</h3>
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label htmlFor="reg-username">Usuario</label>
              <input
                id="reg-username"
                placeholder="Crea un nombre de usuario"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                disabled={regLoading}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="reg-email">Correo Electrónico</label>
              <input
                id="reg-email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                disabled={regLoading}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                disabled={regLoading}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="reg-confirm-password">Confirmar Contraseña</label>
              <input
                id="reg-confirm-password"
                type="password"
                placeholder="Repite tu contraseña"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required
                disabled={regLoading}
              />
            </div>
            
            <button type="submit" disabled={regLoading} className="btn-register">
              {regLoading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>
          
          {regError && <p className="error-message">{regError}</p>}
          {regSuccess && <p className="success-message">{regSuccess}</p>}
          
          <div className="toggle-form">
            <p>¿Ya tienes cuenta?</p>
            <button 
              className="btn-toggle" 
              onClick={() => setRegisterMode(false)}
              disabled={regLoading}
            >
              Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #9b1b30 0%, #c22940 50%, #d6334a 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: white;
        }
        
        .header-section {
          text-align: center;
          margin-bottom: 40px;
          width: 100%;
          max-width: 800px;
          padding-top: 20px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          gap: 20px;
        }
        
        .logo-edomex {
          display: flex;
          align-items: center;
        }
        
        .logo-circle {
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid #ffcc00;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .logo-text {
          color: #9b1b30;
          font-weight: bold;
          font-size: 24px;
        }
        
        .main-title {
          font-size: 2.8rem;
          margin: 0;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          font-weight: 700;
          letter-spacing: 1px;
        }
        
        .subtitle {
          font-size: 1.4rem;
          margin: 10px 0 0 0;
          color: #ffcc00;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        
        .forms-container {
          display: flex;
          width: 100%;
          max-width: 900px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          min-height: 500px;
          position: relative;
        }
        
        .login-form, .register-form {
          flex: 1;
          padding: 40px;
          transition: all 0.5s ease;
        }
        
        .login-form {
          background: white;
          color: #333;
        }
        
        .register-form {
          background: #f9f9f9;
          color: #333;
        }
        
        .form-inactive {
          opacity: 0;
          transform: translateX(20px);
          pointer-events: none;
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        h3 {
          color: #9b1b30;
          font-size: 1.8rem;
          margin-top: 0;
          margin-bottom: 30px;
          text-align: center;
          border-bottom: 2px solid #9b1b30;
          padding-bottom: 10px;
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #555;
        }
        
        .input-group input {
          width: 100%;
          padding: 14px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }
        
        .input-group input:focus {
          border-color: #9b1b30;
          outline: none;
          box-shadow: 0 0 0 2px rgba(155, 27, 48, 0.2);
        }
        
        .input-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
        
        button {
          cursor: pointer;
          border: none;
          font-weight: 600;
          font-size: 16px;
          border-radius: 8px;
          transition: all 0.3s;
        }
        
        .btn-login {
          width: 100%;
          padding: 16px;
          background: linear-gradient(to right, #9b1b30, #c22940);
          color: white;
          margin-top: 10px;
        }
        
        .btn-login:hover:not(:disabled) {
          background: linear-gradient(to right, #8a172a, #b02136);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(155, 27, 48, 0.4);
        }
        
        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      
        .toggle-form {
          margin-top: 30px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .toggle-form p {
          color: #666;
          margin-bottom: 10px;
        }
        
        .btn-toggle {
          background: transparent;
          color: #9b1b30;
          padding: 10px 20px;
          border: 2px solid #9b1b30;
        }
        
        .btn-toggle:hover:not(:disabled) {
          background: #9b1b30;
          color: white;
        }
        
        .btn-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #d32f2f;
          background: #ffebee;
          padding: 12px;
          border-radius: 6px;
          margin-top: 20px;
          text-align: center;
          border-left: 4px solid #d32f2f;
        }
        
        .success-message {
          color: #2e7d32;
          background: #e8f5e9;
          padding: 12px;
          border-radius: 6px;
          margin-top: 20px;
          text-align: center;
          border-left: 4px solid #2e7d32;
        }
        
        @media (max-width: 768px) {
          .forms-container {
            flex-direction: column;
          }
          
          .login-form, .register-form {
            width: 100%;
          }
          
          .form-inactive {
            display: none;
          }
          
          .logo-section {
            flex-direction: column;
            gap: 10px;
          }
          
          .main-title {
            font-size: 2.2rem;
          }
          
          .subtitle {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  )
}