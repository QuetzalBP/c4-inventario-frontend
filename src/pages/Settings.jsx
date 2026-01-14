// src/pages/Settings.jsx
import { useState, useEffect } from "react"
import api from "../api/axios"
import * as XLSX from "xlsx"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Estados para crear usuario
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "USER"
  })
  
  // Estados para editar usuario
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    role: "USER"
  })

  const currentUser = (() => {
  try {
    const userStr = localStorage.getItem("user")
    if (!userStr || userStr === "undefined" || userStr === "null" || userStr.trim() === "") {
      return {}
    }
    return JSON.parse(userStr)
  } catch (error) {
    console.error("Error parsing user data:", error)
    localStorage.removeItem("user") // Limpia dato corrupto
    return {}
  }
})()

  useEffect(() => {
    loadUsers()
    loadProducts()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await api.get("/users").catch(() => ({ data: [] }))
      setUsers(res.data)
    } catch (err) {
      console.error("Error al cargar usuarios:", err)
    }
  }

  const loadProducts = async () => {
    try {
      const res = await api.get("/products")
      setProducts(res.data)
    } catch (err) {
      console.error("Error al cargar productos:", err)
    }
  }

  // Crear usuario
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!newUser.username || !newUser.password) {
      setError("Usuario y contraseña son requeridos")
      return
    }

    if (newUser.password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres")
      return
    }

    try {
      setLoading(true)
      await api.post("/users", newUser)
      setSuccess("Usuario creado exitosamente")
      setNewUser({ username: "", password: "", role: "USER" })
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  // Eliminar usuario
  const handleDeleteUser = async (userId, username) => {
    if (userId === currentUser.id) {
      alert("No puedes eliminar tu propia cuenta")
      return
    }

    if (window.confirm(`¿Estás seguro de eliminar al usuario "${username}"?`)) {
      try {
        setLoading(true)
        await api.delete(`/users/${userId}`)
        setSuccess("Usuario eliminado exitosamente")
        loadUsers()
      } catch (err) {
        setError(err.response?.data?.message || "Error al eliminar usuario")
      } finally {
        setLoading(false)
      }
    }
  }

  // Iniciar edición
  const startEdit = (user) => {
    setEditingUser(user.id)
    setEditForm({
      username: user.username,
      password: "",
      role: user.role
    })
    setError("")
    setSuccess("")
  }

  // Cancelar edición
  const cancelEdit = () => {
    setEditingUser(null)
    setEditForm({ username: "", password: "", role: "USER" })
    setError("")
  }

  // Guardar edición
  const handleEditUser = async (userId) => {
    setError("")
    setSuccess("")

    if (!editForm.username) {
      setError("El nombre de usuario es requerido")
      return
    }

    if (editForm.password && editForm.password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres")
      return
    }

    try {
      setLoading(true)
      const updateData = {
        username: editForm.username,
        role: editForm.role
      }
      
      if (editForm.password) {
        updateData.password = editForm.password
      }

      await api.put(`/users/${userId}`, updateData)
      setSuccess("Usuario actualizado exitosamente")
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar usuario")
    } finally {
      setLoading(false)
    }
  }

  // Exportar productos a Excel
  const exportToExcel = () => {
    const exportData = products.map(p => ({
      'ID Producto': p.productId,
      'Nombre': p.name,
      'Descripción': p.description || '',
      'Marca': p.brand || '',
      'Modelo': p.model || '',
      'Número de Serie': p.serialNumber || '',
      'Estado': p.status,
      'Cantidad': p.quantity || 1,
      'Precio': p.price || '',
      'Categoría': p.category || '',
      'Ubicación': p.location || '',
      'Notas': p.notes || '',
      'Creado Por': p.createdBy || '',
      'Actualizado Por': p.updatedBy || '',
      'Fecha Creación': p.createdAt ? new Date(p.createdAt).toLocaleString('es-ES') : '',
      'Última Modificación': p.updatedAt ? new Date(p.updatedAt).toLocaleString('es-ES') : ''
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Productos")
    
    const now = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `inventario_completo_${now}.xlsx`)
    
    setSuccess("Base de datos exportada exitosamente")
    setTimeout(() => setSuccess(""), 3000)
  }

  const getRoleBadge = (role) => {
    if (role === "ADMIN") {
      return { bg: '#fee2e2', text: '#991b1b', label: 'Administrador' }
    }
    return { bg: '#dbeafe', text: '#1e40af', label: 'Usuario' }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px' }}>⚙️ Configuración</h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Administración del sistema y usuarios
        </p>
      </div>

      {/* Mensajes */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #86efac',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e5e7eb',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '15px',
              background: activeTab === 'users' ? '#f0f9ff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'users' ? '2px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'users' ? '600' : '400',
              color: activeTab === 'users' ? '#1e40af' : '#64748b',
              fontSize: '14px',
              marginBottom: '-2px'
            }}
          >
            👥 Usuarios
          </button>
          <button
            onClick={() => setActiveTab('database')}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '15px',
              background: activeTab === 'database' ? '#f0f9ff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'database' ? '2px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'database' ? '600' : '400',
              color: activeTab === 'database' ? '#1e40af' : '#64748b',
              fontSize: '14px',
              marginBottom: '-2px'
            }}
          >
            💾 Base de Datos
          </button>
          <button
            onClick={() => setActiveTab('about')}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '15px',
              background: activeTab === 'about' ? '#f0f9ff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'about' ? '2px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'about' ? '600' : '400',
              color: activeTab === 'about' ? '#1e40af' : '#64748b',
              fontSize: '14px',
              marginBottom: '-2px'
            }}
          >
            ℹ️ Información
          </button>
        </div>
      </div>

      {/* Contenido de Usuarios */}
      {activeTab === 'users' && (
        <div>
          {/* Formulario crear usuario */}
          {currentUser.role === "ADMIN" && (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              padding: '25px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>➕</span>
                Crear Nuevo Usuario
              </h3>

              <form onSubmit={handleCreateUser}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontWeight: '500',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      Usuario *
                    </label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      placeholder="Nombre de usuario"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontWeight: '500',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Mínimo 4 caracteres"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontWeight: '500',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      Rol *
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="USER">Usuario</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#9ca3af' : '#22c55e',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>✓</span>
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </form>
            </div>
          )}

          {/* Lista de usuarios */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '25px'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>👥</span>
              Usuarios del Sistema ({users.length})
            </h3>

            {users.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {users.map(user => {
                  const roleBadge = getRoleBadge(user.role)
                  const isCurrentUser = user.id === currentUser.id
                  const isEditing = editingUser === user.id

                  return (
                    <div
                      key={user.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '15px',
                        background: isCurrentUser ? '#f0f9ff' : 'white'
                      }}
                    >
                      {!isEditing ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                                {user.username}
                              </h4>
                              {isCurrentUser && (
                                <span style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  TÚ
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{
                                background: roleBadge.bg,
                                color: roleBadge.text,
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>
                                {roleBadge.label}
                              </span>
                              {user.createdAt && (
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                  Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                </span>
                              )}
                            </div>
                          </div>

                          {currentUser.role === "ADMIN" && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => startEdit(user)}
                                style={{
                                  background: '#f0f9ff',
                                  border: '1px solid #bae6fd',
                                  color: '#0369a1',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '500'
                                }}
                              >
                                ✏️ Editar
                              </button>
                              {!isCurrentUser && (
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                  style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                  }}
                                >
                                  🗑️ Eliminar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h4 style={{ marginBottom: '15px', fontSize: '15px' }}>Editando usuario</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                            <div>
                              <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                                Usuario
                              </label>
                              <input
                                type="text"
                                value={editForm.username}
                                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '14px'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                                Nueva Contraseña (opcional)
                              </label>
                              <input
                                type="password"
                                value={editForm.password}
                                onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                placeholder="Dejar vacío para no cambiar"
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '14px'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                                Rol
                              </label>
                              <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  background: 'white',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="USER">Usuario</option>
                                <option value="ADMIN">Administrador</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleEditUser(user.id)}
                              disabled={loading}
                              style={{
                                background: loading ? '#9ca3af' : '#22c55e',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              ✓ Guardar
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                background: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <p>No hay usuarios registrados</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido de Base de Datos */}
      {activeTab === 'database' && (
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '25px'
        }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>💾</span>
            Gestión de Base de Datos
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              padding: '20px',
              background: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0369a1', marginBottom: '8px' }}>
                {products.length}
              </div>
              <div style={{ fontSize: '14px', color: '#0c4a6e' }}>
                Productos en el sistema
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #86efac'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#166534', marginBottom: '8px' }}>
                {users.length}
              </div>
              <div style={{ fontSize: '14px', color: '#14532d' }}>
                Usuarios registrados
              </div>
            </div>
          </div>

          <div style={{
            padding: '20px',
            background: '#fefce8',
            borderRadius: '8px',
            border: '1px solid #fde047',
            marginBottom: '25px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              Exportar Base de Datos
            </h4>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#713f12' }}>
              Descarga un archivo Excel con todos los productos del inventario, incluyendo toda la información detallada.
            </p>
            <button
              onClick={exportToExcel}
              style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>📥</span>
              Descargar Excel Completo
            </button>
          </div>

          <div style={{
            padding: '15px',
            background: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#6b7280'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>ℹ️ Información del archivo:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Formato: Microsoft Excel (.xlsx)</li>
              <li>Incluye: ID, nombre, descripción, marca, modelo, serie, estado, cantidad, precio, categoría, ubicación, usuarios y fechas</li>
              <li>Compatible con Excel, Google Sheets y LibreOffice</li>
            </ul>
          </div>
        </div>
      )}

      {/* Contenido de Información */}
      {activeTab === 'about' && (
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '25px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '15px'
            }}>
              📦
            </div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#111827' }}>
              Sistema de Inventario C4
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              Versión 1.0.0
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>✨</span>
                Características
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
                <li>Gestión completa de productos</li>
                <li>Control de usuarios y roles</li>
                <li>Reportes y auditoría</li>
                <li>Exportación a PDF y Excel</li>
                <li>Seguimiento de movimientos</li>
              </ul>
            </div>

            <div style={{
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🛠️</span>
                Tecnologías
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
                <li>Frontend: React 18, React Router</li>
                <li>Backend: Node.js, Express</li>
                <li>Base de datos: MongoDB / PostgreSQL</li>
                <li>Autenticación: JWT</li>
                <li>Reportes: Excel.js, PDFMake</li>
              </ul>
            </div>

            <div style={{
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>👨‍💻</span>
                Soporte
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
                <li>Contacto: soporte@inventarioc4.com</li>
                <li>Documentación: docs.inventarioc4.com</li>
                <li>Soporte técnico 24/7</li>
                <li>Actualizaciones mensuales</li>
              </ul>
            </div>
          </div>

          <div style={{
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📋</span>
              Licencia y Términos
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
              Sistema de Inventario C4 © 2024. Todos los derechos reservados.
              Este software es propiedad de la organización y su uso está restringido a personal autorizado.
              Cualquier modificación o distribución no autorizada está estrictamente prohibida.
            </p>
          </div>

          <div style={{
            padding: '15px',
            background: '#fefce8',
            borderRadius: '8px',
            border: '1px solid #fde047'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px', color: '#ca8a04' }}>⚠️</span>
              <p style={{ margin: 0, fontSize: '13px', color: '#713f12', fontWeight: '500' }}>
                Usuario actual conectado
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <span style={{
                background: '#1e40af',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                {currentUser.username || 'No identificado'}
              </span>
              <span style={{
                background: currentUser.role === 'ADMIN' ? '#fee2e2' : '#dbeafe',
                color: currentUser.role === 'ADMIN' ? '#991b1b' : '#1e40af',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                {currentUser.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                ID: {currentUser.id || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}