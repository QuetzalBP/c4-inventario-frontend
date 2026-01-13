// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Layout from "./components/Layout.jsx"
import ProtectedRoute from "./routes/ProtectedRoute.jsx"
import ProductsTable from "./pages/ProductsTable.jsx"
import AddProduct from "./pages/AddProduct.jsx"
import Movements from "./pages/Movements.jsx"
import Reports from "./pages/Reports.jsx"
import Settings from "./pages/Settings.jsx"
import EditProduct from "./pages/EditProduct.jsx" 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas con Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsTable />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App