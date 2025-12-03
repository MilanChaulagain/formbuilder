import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import CreateForm from './pages/CreateForm/CreateForm';
import FormRenderer from './components/FormRenderer/FormRenderer';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './pages/ProductList/ProductList';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import ProductCreate from './pages/ProductCreate/ProductCreate';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateForm />} />
        <Route path="/form/:slug" element={<FormRenderer />} />
        <Route path="/dashboard/:slug" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/create" element={<ProductCreate />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
