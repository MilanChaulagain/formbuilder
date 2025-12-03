import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/ecommerce';
import { productApi } from '../../services/ecommerceApi';
import './ProductList.css';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productApi.getAllProducts();
      const productsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data as any).results || [];
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productApi.deleteProduct(productId);
      setProducts(products.filter(p => p.product_id !== productId));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => 
    !filter || p.product_type.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div className="product-list loading">Loading products...</div>;
  }

  return (
    <div className="product-list">
      <div className="product-header">
        <div>
          <h1>Products</h1>
          <p>Manage your e-commerce products</p>
        </div>
        <Link to="/products/create" className="create-button">
          ➕ Add Product
        </Link>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Filter by product type..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h2>No products found</h2>
            <p>Create your first product to get started</p>
            <Link to="/products/create" className="create-button-large">
              Add Product
            </Link>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.product_id} className="product-card">
              <div className="product-card-header">
                <h3>{product.product_name}</h3>
                <span className={`sellable-badge ${product.sellable}`}>
                  {product.sellable === 'yes' ? '✓ Sellable' : '✗ Not Sellable'}
                </span>
              </div>

              <div className="product-details">
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{product.product_type}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Sales:</span>
                  <span className="value">${product.total_sales?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Orders:</span>
                  <span className="value">{product.sales_count || 0}</span>
                </div>
              </div>

              <div className="product-actions">
                <Link to={`/products/${product.product_id}`} className="action-btn view-btn">
                  👁️ View
                </Link>
                <Link to={`/products/${product.product_id}/sales`} className="action-btn sales-btn">
                  📊 Sales
                </Link>
                <button 
                  onClick={() => deleteProduct(product.product_id!)} 
                  className="action-btn delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="product-meta">
                Created {new Date(product.created_at!).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
