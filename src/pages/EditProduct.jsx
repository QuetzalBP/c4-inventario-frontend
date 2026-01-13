// pages/EditProduct.jsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState({
    productId: "",
    name: "",
    brand: "",
    model: "",
    serialNumber: "",
    description: "",
    category: "",
    status: "Bodega",
    location: "",
    quantity: "",
    price: "",
    purchaseDate: "",
    warrantyExpiry: "",
    supplier: "",
    notes: "",
    // Campos de seguimiento (solo lectura)
    createdBy: "",
    updatedBy: "",
    createdAt: "",
    updatedAt: ""
  })
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [currentUser, setCurrentUser] = useState("") // Para capturar el usuario actual

  // Opciones de categoría (igual que en AddProduct)
  const categoryOptions = [
    "Computadoras",
    "Monitores",
    "Impresoras",
    "Redes",
    "Telefonía",
    "Almacenamiento",
    "Accesorios",
    "Mobiliario",
    "Herramientas",
    "Otros"
  ]

  // Opciones de estado (igual que en AddProduct)
  const statusOptions = [
    { value: "En campo", label: "En campo" },
    { value: "Bodega", label: "Bodega" },
    { value: "Entrega a recepción", label: "Entrega a recepción" },
    { value: "Prestado", label: "Prestado" },
    { value: "En reparación", label: "En reparación" },
    { value: "Obsoleto", label: "Obsoleto" }
  ]

  useEffect(() => {
    if (id) {
      loadProduct()
    }
    // Obtener el usuario actual del sistema (esto dependerá de tu sistema de autenticación)
    const user = localStorage.getItem("user") || "admin"
    setCurrentUser(user)
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/products/${id}`)
      setProduct(res.data)
    } catch (err) {
      console.error("Error al cargar producto:", err)
      setError("No se pudo cargar el producto")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProduct(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validación básica
    if (!product.name.trim() || !product.productId.trim()) {
      setError("El nombre y ID del producto son requeridos")
      return
    }

    try {
      setSubmitting(true)
      setError("")
      
      // Agregar información de auditoría
      const productToUpdate = {
        ...product,
        updatedBy: currentUser, // Agregar usuario que está haciendo la modificación
        updatedAt: new Date().toISOString()
      }
      
      await api.put(`/products/${id}`, productToUpdate)
      
      setSuccess("Producto actualizado exitosamente!")
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate("/products")
      }, 1500)
      
    } catch (err) {
      console.error("Error al actualizar producto:", err)
      setError(err.response?.data?.message || "Error al actualizar el producto")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/products")
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "No disponible"
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#64748b' }}>Cargando producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h1 style={{ margin: 0 }}>Editar Producto</h1>
          <button
            onClick={handleCancel}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancelar
          </button>
        </div>
        <p style={{ color: '#64748b', margin: 0 }}>
          Editando producto: <strong>{product.name}</strong> (ID: {product.productId})
        </p>
      </div>

      {/* Mensajes de éxito/error */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #059669',
          color: '#059669',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      {/* Información de Auditoría (solo lectura) */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          marginBottom: '15px',
          color: '#1e40af'
        }}>
          📋 Información de Auditoría
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              Creado por
            </label>
            <div style={{
              padding: '8px 12px',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '14px' }}>👤</span>
              <span style={{ fontWeight: '500' }}>{product.createdBy || "No registrado"}</span>
            </div>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              Fecha de creación
            </label>
            <div style={{
              padding: '8px 12px',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {formatDate(product.createdAt)}
            </div>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              Última modificación por
            </label>
            <div style={{
              padding: '8px 12px',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '14px' }}>✏️</span>
              <span style={{ fontWeight: '500' }}>{product.updatedBy || "No modificado"}</span>
            </div>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              Última modificación
            </label>
            <div style={{
              padding: '8px 12px',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {formatDate(product.updatedAt) || "No modificado"}
            </div>
          </div>
        </div>
        
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#f0f9ff',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#0369a1',
          border: '1px solid #bae6fd'
        }}>
          <strong>Nota:</strong> Esta edición será registrada bajo el usuario: <strong>{currentUser}</strong>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '30px'
        }}>
          
          {/* Información Básica */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '2px solid #3b82f6',
              color: '#1e40af'
            }}>
              Información Básica
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  ID del Producto *
                </label>
                <input
                  type="text"
                  name="productId"
                  value={product.productId}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Marca
                </label>
                <input
                  type="text"
                  name="brand"
                  value={product.brand}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Modelo
                </label>
                <input
                  type="text"
                  name="model"
                  value={product.model}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Número de Serie
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={product.serialNumber}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Categoría
                </label>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="">Seleccionar categoría</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Descripción
              </label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Estado y Ubicación */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '2px solid #3b82f6',
              color: '#1e40af'
            }}>
              Estado y Ubicación
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Estado *
                </label>
                <select
                  name="status"
                  value={product.status}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={product.location}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Información de Inventario */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '2px solid #3b82f6',
              color: '#1e40af'
            }}>
              Información de Inventario
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Cantidad
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={product.quantity}
                  onChange={handleChange}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Precio (MXN)
                </label>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={product.purchaseDate ? product.purchaseDate.split('T')[0] : ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Vencimiento de Garantía
                </label>
                <input
                  type="date"
                  name="warrantyExpiry"
                  value={product.warrantyExpiry ? product.warrantyExpiry.split('T')[0] : ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Proveedor
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={product.supplier}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notas Adicionales */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '2px solid #3b82f6',
              color: '#1e40af'
            }}>
              Notas Adicionales
            </h3>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Notas
              </label>
              <textarea
                name="notes"
                value={product.notes}
                onChange={handleChange}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Agregar notas adicionales sobre el producto..."
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              Esta modificación será registrada bajo el usuario: <strong>{currentUser}</strong>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  minWidth: '120px'
                }}
                disabled={submitting}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                style={{
                  background: '#3b82f6',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  minWidth: '120px'
                }}
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}