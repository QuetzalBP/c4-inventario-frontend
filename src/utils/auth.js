// frontend/src/utils/auth.js
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      return JSON.parse(userStr)
    }
    return null
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    return null
  }
}

export const getCurrentUsername = () => {
  const user = getCurrentUser()
  return user ? user.username : "admin"
}

export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null
}