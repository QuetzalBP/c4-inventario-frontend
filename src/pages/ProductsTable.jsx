// pages/ProductsTable.jsx
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api/axios"

export default function ProductsTable() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get("/products")
      setProducts(res.data)
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError("Error al cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar un producto
  const handleDelete = async (id, productName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"?`)) {
      try {
        await api.delete(`/products/${id}`)
        // Actualizar la lista eliminando el producto
        setProducts(products.filter(product => product.id !== id))
        alert("Producto eliminado exitosamente")
      } catch (err) {
        console.error("Error al eliminar producto:", err)
        alert("Error al eliminar el producto")
      }
    }
  }

  // Función para editar un producto
  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`)
  }

  // Función para ordenar la tabla
  const requestSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  // Función para filtrar y ordenar productos
  const getFilteredAndSortedProducts = () => {
    let filtered = products

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.createdBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.updatedBy?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter)
    }

    // Ordenar
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key] || ""
        let bValue = b[sortConfig.key] || ""

        // Convertir a string para comparación
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }

  // Calcular estadísticas
  const totalProducts = products.length
  const filteredProducts = getFilteredAndSortedProducts()

  // Obtener el último usuario que interactuó con el producto
  const getLastUser = (product) => {
    // Prioridad: updatedBy -> createdBy -> "Desconocido"
    return product.updatedBy || product.createdBy || "Desconocido"
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Estilo para encabezados ordenables
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
    }
    return ''
  }

  // Obtener ícono según acción del usuario
  const getUserIcon = (product) => {
    if (product.updatedBy) return "✏️" // Editado
    if (product.createdBy) return "➕" // Creado
    return "👤" // Usuario genérico
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px' }}>Tabla de Productos</h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Gestiona todos los productos de tu inventario - Seguimiento de usuarios
        </p>
      </div>

      {/* Panel superior con estadística, búsqueda y filtros */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* Tarjeta única de estadística */}
          <div style={{
            background: '#f0f9ff',
            padding: '15px 20px',
            borderRadius: '8px',
            border: '1px solid #bae6fd',
            minWidth: '180px',
            flexShrink: 0
          }}>
            <p style={{
              margin: '0 0 5px 0',
              fontSize: '14px',
              color: '#0369a1',
              fontWeight: '500'
            }}>Total de Productos</p>
            <p style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#0c4a6e'
            }}>{totalProducts}</p>
          </div>

          {/* Contenedor de búsqueda y filtros */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            alignItems: 'center',
            minWidth: '300px'
          }}>
            {/* Barra de búsqueda */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>🔍</span>
                <label htmlFor="search" style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Buscar productos
                </label>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Buscar por nombre, ID, usuario, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Filtro por estado */}
            <div style={{ minWidth: '150px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>📊</span>
                <label htmlFor="statusFilter" style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Estado
                </label>
              </div>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                <option value="all">Todos los estados</option>
                <option value="Bodega">Bodega</option>
                <option value="En campo">En campo</option>
                <option value="Prestado">Prestado</option>
                <option value="En reparación">En reparación</option>
                <option value="Obsoleto">Obsoleto</option>
              </select>
            </div>

            {/* Botón agregar */}
            <div style={{ alignSelf: 'flex-end', minWidth: '150px' }}>
              <Link
                to="/add-product"
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  justifyContent: 'center',
                  width: '100%',
                  boxSizing: 'border-box',
                  height: '40px'
                }}
              >
                <span style={{ fontSize: '18px' }}>+</span>
                Nuevo Producto
              </Link>
            </div>
          </div>
        </div>

        {/* Información de filtros */}
        {searchTerm || statusFilter !== "all" ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            marginTop: '15px',
            fontSize: '14px'
          }}>
            <div>
              Mostrando <strong>{filteredProducts.length}</strong> de <strong>{totalProducts}</strong> productos
              {searchTerm && (
                <span> para "<strong>{searchTerm}</strong>"</span>
              )}
              {statusFilter !== "all" && (
                <span> con estado "<strong>{statusFilter}</strong>"</span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>

      {/* Tabla de productos */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px'
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#64748b' }}>Cargando productos...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '1100px'
                }}>
                  <thead>
                    <tr style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <th 
                        style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                        onClick={() => requestSort('productId')}
                      >
                        ID{getSortIndicator('productId')}
                      </th>
                      <th 
                        style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                        onClick={() => requestSort('name')}
                      >
                        Nombre{getSortIndicator('name')}
                      </th>
                      <th 
                        style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                        onClick={() => requestSort('brand')}
                      >
                        Marca{getSortIndicator('brand')}
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                        Modelo
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                        No. Serie
                      </th>
                      <th 
                        style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                        onClick={() => requestSort('status')}
                      >
                        Estado{getSortIndicator('status')}
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                        Ubicación
                      </th>
                      <th 
                        style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                        onClick={() => requestSort('createdBy')}
                      >
                        Usuario{getSortIndicator('createdBy')}
                      </th>
                      <th 
                        style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                        onClick={() => requestSort('updatedAt')}
                      >
                        Última Modificación{getSortIndicator('updatedAt')}
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr 
                        key={product.id} 
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <code style={{
                            background: '#f3f4f6',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                          }}>
                            {product.productId}
                          </code>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                          {product.name}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {product.brand || '-'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {product.model || '-'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {product.serialNumber || '-'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'inline-block',
                            background:
                              product.status === 'Bodega' ? '#dbeafe' :
                              product.status === 'En campo' ? '#fef3c7' :
                              product.status === 'Prestado' ? '#fee2e2' :
                              product.status === 'En reparación' ? '#f3e8ff' :
                              product.status === 'Obsoleto' ? '#f5f5f5' :
                              '#f3f4f6',
                            color:
                              product.status === 'Bodega' ? '#1e40af' :
                              product.status === 'En campo' ? '#92400e' :
                              product.status === 'Prestado' ? '#dc2626' :
                              product.status === 'En reparación' ? '#7c3aed' :
                              product.status === 'Obsoleto' ? '#6b7280' :
                              '#6b7280'
                          }}>
                            {product.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {product.location || 'No asignada'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{ fontSize: '14px' }}>
                              {getUserIcon(product)}
                            </span>
                            <div>
                              <div style={{ fontWeight: '500' }}>
                                {getLastUser(product)}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                display: 'flex',
                                gap: '4px'
                              }}>
                                {product.updatedBy && (
                                  <span style={{
                                    background: '#e5e7eb',
                                    padding: '1px 4px',
                                    borderRadius: '2px',
                                    fontSize: '10px'
                                  }}>
                                    Editado
                                  </span>
                                )}
                                {product.createdBy && !product.updatedBy && (
                                  <span style={{
                                    background: '#dcfce7',
                                    padding: '1px 4px',
                                    borderRadius: '2px',
                                    fontSize: '10px',
                                    color: '#166534'
                                  }}>
                                    Creado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                          {product.updatedAt ? (
                            <>
                              <div style={{ marginBottom: '2px' }}>
                                {formatDate(product.updatedAt)}
                              </div>
                              {product.createdAt !== product.updatedAt && (
                                <div style={{
                                  fontSize: '11px',
                                  color: '#9ca3af'
                                }}>
                                  (editado)
                                </div>
                              )}
                            </>
                          ) : product.createdAt ? (
                            <div>
                              {formatDate(product.createdAt)}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'flex-start'
                          }}>
                            {/* Botón Editar */}
                            <button
                              onClick={() => handleEdit(product.id)}
                              style={{
                                background: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0369a1'
                              }}
                              title="Editar producto"
                            >
                              <span style={{ fontSize: '16px' }}>✏️</span>
                            </button>
                            
                            {/* Botón Eliminar */}
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#dc2626'
                              }}
                              title="Eliminar producto"
                            >
                              <span style={{ fontSize: '16px' }}>🗑️</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#64748b'
              }}>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                  {products.length === 0 
                    ? 'No hay productos en el inventario' 
                    : 'No se encontraron productos con los filtros aplicados'}
                </p>
                <Link
                  to="/add-product"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  {products.length === 0 
                    ? 'Agregar primer producto' 
                    : 'Agregar nuevo producto'}
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Información del sistema */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f8fafc',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#64748b',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>
          Sistema de seguimiento de inventario - Se muestran los usuarios responsables de cada producto
        </p>
      </div>
    </div>
  )
}