import React from 'react';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import ProductComparison from './pages/ProductComparison';
import RegisterShop from './pages/RegisterShop';
import OwnerDashboard from './pages/OwnerDashboard';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId/compare" element={<ProductComparison />} />
        <Route path="/register-shop" element={<RegisterShop />} />
        <Route path="/owner-dashboard/*" element={<OwnerDashboard />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
