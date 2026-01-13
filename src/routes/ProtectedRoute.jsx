// routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode" // Instala: npm install jwt-decode

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Verifica si el token ha expirado
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000

    if (decoded.exp < currentTime) {
      // Token expirado, limpia y redirige
      localStorage.removeItem("token")
      return <Navigate to="/login" replace />
    }
  } catch (error) {
    // Token inválido, limpia y redirige
    console.error("Token inválido:", error)
    localStorage.removeItem("token")
    return <Navigate to="/login" replace />
  }

  return children
}