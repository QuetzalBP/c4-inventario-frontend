// src/pages/AddProduct.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

export default function AddProduct() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [product, setProduct] = useState({
    name: "",
    description: "",
    brand: "",
    model: "",
    serialNumber: "",
    status: "Bodega",
    quantity: 1,
    price: "",
    category: "",
    notes: "",
    location: "",
    purchaseDate: "",
    warrantyExpiry: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setProduct(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await api.post("/products", product, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setSuccess("✅ Producto creado exitosamente!")
      setProduct({
        name: "",
        description: "",
        brand: "",
        model: "",
        serialNumber: "",
        status: "Bodega",
        quantity: 1,
        price: "",
        category: "",
        notes: "",
        location: "",
        purchaseDate: "",
        warrantyExpiry: ""
      })

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/products")
      }, 2000)

    } catch (err) {
      console.error("Error al crear producto:", err)
      setError(err.response?.data?.message || "Error al crear el producto")
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: "En campo", label: "En campo" },
    { value: "Bodega", label: "Bodega" },
    { value: "Entrega a recepción", label: "Entrega a recepción" },
    { value: "Prestado", label: "Prestado" }
  ]

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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Agregar Nuevo Producto</h1>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #10b981',
          color: '#059669',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Columna izquierda */}
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
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
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Ej: Laptop Dell Inspiron 15"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
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
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Ej: Dell, HP, Lenovo"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
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
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Ej: Inspiron 15, ThinkPad X1"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                color: '#374151'
              }}>
                No. Serie
              </label>
              <input
                type="text"
                name="serialNumber"
                value={product.serialNumber}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Ej: DEL123456789"
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
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
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
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
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
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
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="0.00"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
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
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Ej: Almacén Principal, Oficina 3"
              />
            </div>
          </div>
        </div>

        {/* Campos de ancho completo */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px',
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
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Descripción detallada del producto..."
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Notas
          </label>
          <textarea
            name="notes"
            value={product.notes}
            onChange={handleChange}
            rows="2"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Notas adicionales..."
          />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '25px'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Fecha de Compra
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={product.purchaseDate}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Fin de Garantía
            </label>
            <input
              type="date"
              name="warrantyExpiry"
              value={product.warrantyExpiry}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '15px',
          justifyContent: 'flex-end',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '20px'
        }}>
          <button
            type="button"
            onClick={() => navigate("/products")}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creando Producto...' : 'Guardar Producto'}
          </button>
        </div>

        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          background: '#f8fafc',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <p><strong>Nota:</strong></p>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>El ID del producto se generará automáticamente</li>
            <li>Los campos marcados con * son obligatorios</li>
            <li>El número de serie debe ser único</li>
          </ul>
        </div>
      </form>
    </div>
  )
}