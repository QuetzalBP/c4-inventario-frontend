// pages/Dashboard.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    todayMovements: 0,
    byStatus: {},
    recentActivity: [],
    topProducts: []
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsRes, movementsRes] = await Promise.all([
        api.get("/products"),
        api.get("/movements").catch(() => ({ data: [] }))
      ])
      
      setProducts(productsRes.data)
      
      // Si no hay movimientos, generar algunos de ejemplo
      let movementsData = movementsRes.data
      if (movementsData.length === 0) {
        movementsData = generateMovementsFromProducts(productsRes.data)
      }
      setMovements(movementsData)
      
      // Calcular estadísticas
      calculateStats(productsRes.data, movementsData)
      
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError("Error al cargar los datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

  const generateMovementsFromProducts = (productsList) => {
    const generatedMovements = []
    
    productsList.forEach(product => {
      if (product.createdBy) {
        generatedMovements.push({
          id: `${product.id}-created`,
          productId: product.productId,
          productName: product.name,
          movementType: 'Entrada',
          fromStatus: null,
          toStatus: product.status,
          quantity: product.quantity || 1,
          notes: `Producto creado`,
          location: product.location || 'No especificada',
          performedBy: product.createdBy,
          createdAt: product.createdAt || new Date().toISOString()
        })
      }
    })
    
    return generatedMovements.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 10) // Limitar a 10 movimientos
  }

  const calculateStats = (productsData, movementsData) => {
    // Valor total del inventario
    const totalValue = productsData.reduce((acc, prod) =>
      acc + (parseFloat(prod.price) || 0) * (parseInt(prod.quantity) || 0), 0
    )

    // Productos con bajo stock
    const lowStockProducts = productsData.filter(p => (p.quantity || 0) < 10).length

    // Movimientos de hoy
    const today = new Date().toDateString()
    const todayMovements = movementsData.filter(m => {
      const mDate = new Date(m.createdAt)
      return mDate.toDateString() === today
    }).length

    // Productos por estado
    const byStatus = {}
    productsData.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1
    })

    // Actividad reciente (últimos 5 movimientos)
    const recentActivity = [...movementsData]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)

    // Productos más valiosos (top 5 por valor total)
    const topProducts = productsData
      .map(p => ({
        ...p,
        totalValue: (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5)

    setStats({
      totalProducts: productsData.length,
      totalValue,
      lowStock: lowStockProducts,
      todayMovements,
      byStatus,
      recentActivity,
      topProducts
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await api.delete(`/products/${id}`)
        setProducts(products.filter(product => product.id !== id))
        alert("Producto eliminado exitosamente")
        loadData() // Recargar estadísticas
      } catch (err) {
        console.error("Error al eliminar producto:", err)
        alert("Error al eliminar el producto")
      }
    }
  }

  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`)
  }

  const generateQuickReport = () => {
    const doc = new jsDoc()
    const now = new Date()
    
    doc.setFontSize(18)
    doc.text("Reporte Rápido de Inventario", 14, 20)
    
    doc.setFontSize(10)
    doc.text(`Generado: ${now.toLocaleDateString('es-ES')}`, 14, 30)
    
    // Estadísticas
    doc.setFontSize(12)
    doc.text(`Total Productos: ${stats.totalProducts}`, 14, 45)
    doc.text(`Valor Total: $${stats.totalValue.toFixed(2)}`, 14, 55)
    doc.text(`Productos con Bajo Stock: ${stats.lowStock}`, 14, 65)
    
    // Tabla de productos principales
    autoTable(doc, {
      startY: 80,
      head: [['Producto', 'Estado', 'Ubicación', 'Valor']],
      body: stats.topProducts.map(p => [
        p.name,
        p.status,
        p.location || 'N/A',
        `$${(parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)}`
      ]),
      styles: { fontSize: 10 }
    })
    
    doc.save(`reporte_rapido_${now.toISOString().split('T')[0]}.pdf`)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Bodega': return '#3b82f6'
      case 'En campo': return '#f59e0b'
      case 'Prestado': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getMovementIcon = (type) => {
    switch(type) {
      case 'Entrada': return '📥'
      case 'Salida': return '📤'
      case 'Transferencia': return '🔄'
      default: return '📝'
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1f2937' }}>
            Dashboard de Inventario
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Resumen general y métricas clave del sistema
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadData} style={{ 
            background: '#f3f4f6', 
            border: 'none', 
            padding: '10px 16px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#374151'
          }}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p style={{ color: '#6b7280' }}>Cargando dashboard...</p>
        </div>
      ) : error ? (
        <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '8px', color: '#dc2626' }}>
          {error}
        </div>
      ) : (
        <>
          {/* Tarjetas de métricas principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Total Productos */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#dbeafe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>📦</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    Total Productos
                  </p>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>
                    {stats.totalProducts}
                  </h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                En el sistema de inventario
              </p>
            </div>

            {/* Valor Total */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#dcfce7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>💰</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    Valor Total
                  </p>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#166534' }}>
                    ${stats.totalValue.toFixed(2)}
                  </h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Valor total del inventario
              </p>
            </div>

            {/* Bajo Stock */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: stats.lowStock > 0 ? '#fee2e2' : '#f3f4f6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>⚠️</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    Bajo Stock
                  </p>
                  <h3 style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '32px', 
                    fontWeight: 'bold', 
                    color: stats.lowStock > 0 ? '#dc2626' : '#6b7280'
                  }}>
                    {stats.lowStock}
                  </h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Productos con menos de 10 unidades
              </p>
            </div>

            {/* Movimientos Hoy */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#fef3c7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>📊</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    Movimientos Hoy
                  </p>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#92400e' }}>
                    {stats.todayMovements}
                  </h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Actividad registrada hoy
              </p>
            </div>
          </div>

          {/* Segunda fila: Distribución y Actividad */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Distribución por Estado */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>
                📍 Distribución por Estado
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(stats.byStatus).map(([status, count]) => {
                  const percentage = (count / stats.totalProducts * 100).toFixed(1)
                  return (
                    <div key={status} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '12px',
                            height: '12px',
                            background: getStatusColor(status),
                            borderRadius: '50%'
                          }}></span>
                          {status}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: getStatusColor(status),
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actividad Reciente */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>
                ⚡ Actividad Reciente
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: index === 0 ? '#f0f9ff' : 'transparent',
                      borderRadius: '8px',
                      border: index === 0 ? '1px solid #3b82f6' : '1px solid #f3f4f6'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: '#f3f4f6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {getMovementIcon(activity.movementType)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                          {activity.productName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '8px' }}>
                          <span>{activity.movementType}</span>
                          <span>•</span>
                          <span>{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No hay actividad reciente
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Productos más valiosos */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>
                🏆 Productos más Valiosos
              </h3>
              <a href="/products" style={{
                fontSize: '14px',
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Ver todos →
              </a>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Producto</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Marca</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Modelo</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Estado</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Valor Total</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{product.name}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{product.brand || '-'}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{product.model || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: getStatusColor(product.status) + '20',
                          color: getStatusColor(product.status)
                        }}>
                          {product.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#166534' }}>
                        ${product.totalValue.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(product.id)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #d1d5db',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: '#374151',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: '#dc2626',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <a href="/add-product" style={{
              background: '#3b82f6',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <span style={{ fontSize: '32px' }}>➕</span>
              Agregar Producto
            </a>
            
            <a href="/reports" style={{
              background: '#10b981',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <span style={{ fontSize: '32px' }}>📊</span>
              Ver Reportes
            </a>
            
            <a href="/movements" style={{
              background: '#f59e0b',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <span style={{ fontSize: '32px' }}>🔄</span>
              Movimientos
            </a>
          </div>
        </>
      )}
    </div>
  )
}