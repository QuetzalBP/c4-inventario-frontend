import { useState, useEffect } from "react"
import api from "../api/axios"

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  return (
    <div>
      <h1>Gestión de Productos</h1>
      {loading && <p>Cargando productos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Descripción</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Cantidad</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Precio</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Categoría</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.id}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.description}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.quantity}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>${product.price}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}