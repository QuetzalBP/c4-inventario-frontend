// src/pages/Reports.jsx
import { useState, useEffect } from "react"
import api from "../api/axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function Reports() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("movements")
  const [dateFilter, setDateFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

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
      
      if (movementsRes.data.length === 0) {
        const generatedMovements = generateMovementsFromProducts(productsRes.data)
        setMovements(generatedMovements)
      } else {
        setMovements(movementsRes.data)
      }
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError("Error al cargar los datos")
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
          createdAt: product.createdAt
        })
      }
      
      if (product.updatedBy && product.updatedAt !== product.createdAt) {
        generatedMovements.push({
          id: `${product.id}-updated`,
          productId: product.productId,
          productName: product.name,
          movementType: 'Ajuste',
          fromStatus: product.status,
          toStatus: product.status,
          quantity: product.quantity || 1,
          notes: `Producto actualizado`,
          location: product.location || 'No especificada',
          performedBy: product.updatedBy,
          createdAt: product.updatedAt
        })
      }
    })
    
    return generatedMovements.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  }

  const getFilteredMovements = () => {
    let filtered = [...movements]
    
    const now = new Date()
    if (dateFilter === "today") {
      filtered = filtered.filter(m => {
        const mDate = new Date(m.createdAt)
        return mDate.toDateString() === now.toDateString()
      })
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(m => new Date(m.createdAt) >= weekAgo)
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(m => new Date(m.createdAt) >= monthAgo)
    }
    
    if (typeFilter !== "all") {
      filtered = filtered.filter(m => m.movementType === typeFilter)
    }
    
    if (userFilter !== "all") {
      filtered = filtered.filter(m => m.performedBy === userFilter)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.performedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }

  const getUniqueUsers = () => {
    const users = new Set()
    movements.forEach(m => users.add(m.performedBy))
    return Array.from(users).filter(Boolean)
  }

  const getStats = () => {
    const filtered = getFilteredMovements()
    const totalMovements = filtered.length
    const byType = {
      Entrada: filtered.filter(m => m.movementType === 'Entrada').length,
      Salida: filtered.filter(m => m.movementType === 'Salida').length,
      Ajuste: filtered.filter(m => m.movementType === 'Ajuste').length,
      Transferencia: filtered.filter(m => m.movementType === 'Transferencia').length
    }
    
    const byUser = {}
    filtered.forEach(m => {
      byUser[m.performedBy] = (byUser[m.performedBy] || 0) + 1
    })
    
    const byStatus = {}
    products.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1
    })
    
    return { totalMovements, byType, byUser, byStatus }
  }

  const generateMonthlyPDF = () => {
    const doc = new jsPDF()
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const monthlyMovements = movements.filter(m => 
      new Date(m.createdAt) >= monthAgo
    )
    
    doc.setFontSize(18)
    doc.setTextColor(40)
    doc.text("Reporte de Movimientos - Ultimo Mes", 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}`, 14, 28)
    doc.text(`Total de movimientos: ${monthlyMovements.length}`, 14, 34)
    
    const tableData = monthlyMovements.map(m => [
      new Date(m.createdAt).toLocaleDateString('es-ES'),
      new Date(m.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      m.productId || '-',
      m.productName || '-',
      m.movementType || '-',
      m.toStatus || '-',
      m.performedBy || '-',
      m.location || '-'
    ])
    
    autoTable(doc, {
      startY: 40,
      head: [['Fecha', 'Hora', 'ID Prod.', 'Producto', 'Tipo', 'Estado', 'Usuario', 'Ubicacion']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    })
    
    doc.save(`movimientos_mes_${now.toISOString().split('T')[0]}.pdf`)
  }

  const generateInventoryPDF = () => {
    const doc = new jsPDF()
    const now = new Date()
    
    doc.setFontSize(18)
    doc.setTextColor(40)
    doc.text("Inventario Completo de Productos", 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}`, 14, 28)
    doc.text(`Total de productos: ${products.length}`, 14, 34)
    
    const stats = getStats()
    doc.setFontSize(9)
    let yPos = 42
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      doc.text(`${status}: ${count}`, 14, yPos)
      yPos += 5
    })
    
    const tableData = products.map(p => [
      p.productId || '-',
      p.name || '-',
      p.brand || '-',
      p.model || '-',
      p.serialNumber || '-',
      p.status || '-',
      p.location || '-',
      p.createdBy || p.updatedBy || '-'
    ])
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['ID', 'Nombre', 'Marca', 'Modelo', 'Serie', 'Estado', 'Ubicacion', 'Usuario']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    })
    
    doc.save(`inventario_completo_${now.toISOString().split('T')[0]}.pdf`)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '-', time: '-' }
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getMovementIcon = (type) => {
    switch(type) {
      case 'Entrada': return '📥'
      case 'Salida': return '📤'
      case 'Transferencia': return '🔄'
      case 'Ajuste': return '⚙️'
      default: return '📋'
    }
  }

  const getMovementColor = (type) => {
    switch(type) {
      case 'Entrada': return { bg: '#dcfce7', text: '#166534' }
      case 'Salida': return { bg: '#fee2e2', text: '#991b1b' }
      case 'Transferencia': return { bg: '#fef3c7', text: '#92400e' }
      case 'Ajuste': return { bg: '#dbeafe', text: '#1e40af' }
      default: return { bg: '#f3f4f6', text: '#374151' }
    }
  }

  const filteredMovements = getFilteredMovements()
  const stats = getStats()
  const uniqueUsers = getUniqueUsers()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '16px', color: '#64748b' }}>
        Cargando reportes...
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px' }}>📊 Reportes y Auditoría</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Seguimiento completo de movimientos e inventario</p>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button onClick={generateMonthlyPDF} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{ fontSize: '18px' }}>📄</span>
            Generar PDF Movimientos (Último Mes)
          </button>
          
          <button onClick={generateInventoryPDF} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{ fontSize: '18px' }}>📋</span>
            Generar PDF Inventario Completo
          </button>
          
          <button onClick={loadData} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{ fontSize: '18px' }}>🔄</span>
            Actualizar Datos
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
          <button onClick={() => setActiveTab('movements')} style={{ flex: 1, padding: '15px', background: activeTab === 'movements' ? '#f0f9ff' : 'transparent', border: 'none', borderBottom: activeTab === 'movements' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', fontWeight: activeTab === 'movements' ? '600' : '400', color: activeTab === 'movements' ? '#1e40af' : '#64748b', fontSize: '14px', marginBottom: '-2px' }}>
            📝 Historial de Movimientos
          </button>
          <button onClick={() => setActiveTab('stats')} style={{ flex: 1, padding: '15px', background: activeTab === 'stats' ? '#f0f9ff' : 'transparent', border: 'none', borderBottom: activeTab === 'stats' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', fontWeight: activeTab === 'stats' ? '600' : '400', color: activeTab === 'stats' ? '#1e40af' : '#64748b', fontSize: '14px', marginBottom: '-2px' }}>
            📈 Estadísticas
          </button>
        </div>
      </div>

      {activeTab === 'movements' && (
        <>
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '6px' }}>🔍 Buscar</label>
                <input type="text" placeholder="Producto, usuario, notas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '6px' }}>📅 Período</label>
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: 'white', cursor: 'pointer' }}>
                  <option value="all">Todos</option>
                  <option value="today">Hoy</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '6px' }}>📦 Tipo de Movimiento</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: 'white', cursor: 'pointer' }}>
                  <option value="all">Todos</option>
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Ajuste">Ajuste</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '6px' }}>👤 Usuario</label>
                <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: 'white', cursor: 'pointer' }}>
                  <option value="all">Todos</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
            </div>

            {(searchTerm || dateFilter !== 'all' || typeFilter !== 'all' || userFilter !== 'all') && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#f0f9ff', borderRadius: '6px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Mostrando <strong>{filteredMovements.length}</strong> de <strong>{movements.length}</strong> movimientos</span>
                <button onClick={() => { setSearchTerm(''); setDateFilter('all'); setTypeFilter('all'); setUserFilter('all') }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Historial de Actividades</h3>

            {filteredMovements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredMovements.map(movement => {
                  const { date, time } = formatDateTime(movement.createdAt)
                  const colors = getMovementColor(movement.movementType)
                  
                  return (
                    <div key={movement.id} style={{ display: 'flex', gap: '20px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', transition: 'all 0.2s', position: 'relative' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#3b82f6' }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '8px' }}>
                          {getMovementIcon(movement.movementType)}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: colors.text, textAlign: 'center' }}>{movement.movementType}</span>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#111827' }}>{movement.productName}</h4>
                            <code style={{ fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{movement.productId}</code>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>{date}</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{time}</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '8px' }}>
                          {movement.fromStatus && movement.fromStatus !== movement.toStatus && (
                            <div style={{ fontSize: '13px' }}>
                              <span style={{ color: '#6b7280' }}>De: </span>
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{movement.fromStatus}</span>
                            </div>
                          )}
                          
                          <div style={{ fontSize: '13px' }}>
                            <span style={{ color: '#6b7280' }}>{movement.fromStatus && movement.fromStatus !== movement.toStatus ? 'A: ' : 'Estado: '}</span>
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{movement.toStatus}</span>
                          </div>

                          <div style={{ fontSize: '13px' }}>
                            <span style={{ color: '#6b7280' }}>📍 </span>
                            <strong>{movement.location}</strong>
                          </div>

                          <div style={{ fontSize: '13px' }}>
                            <span style={{ color: '#6b7280' }}>👤 </span>
                            <strong>{movement.performedBy}</strong>
                          </div>
                        </div>

                        {movement.notes && (
                          <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic', padding: '8px', background: '#f9fafb', borderRadius: '4px' }}>
                            💬 {movement.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <p style={{ fontSize: '16px' }}>No hay movimientos que mostrar con los filtros aplicados</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px', fontWeight: '500' }}>📊 Total de Movimientos</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 10px 0' }}>{stats.totalMovements}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Registrados en el sistema</p>
          </div>

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px', fontWeight: '500' }}>📦 Por Tipo de Movimiento</h3>
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px' }}>{getMovementIcon(type)} {type}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{count}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / stats.totalMovements) * 100}%`, height: '100%', background: getMovementColor(type).text, borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px', fontWeight: '500' }}>👥 Actividad por Usuario</h3>
            {Object.entries(stats.byUser).sort((a, b) => b[1] - a[1]).map(([user, count]) => (
              <div key={user} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>👤 {user}</span>
                <span style={{ fontSize: '13px', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>{count}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px', fontWeight: '500' }}>📍 Productos por Estado</h3>
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{status}</span>
                <span style={{ fontSize: '13px', background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}