import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Sale } from '../../types/ecommerce';
import { productApi, salesApi } from '../../services/ecommerceApi';
import './ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [newSale, setNewSale] = useState({
    sales_amount: '',
    quantity: '1',
    customer_name: '',
  });

  const loadProduct = useCallback(async () => {
    try {
      const response = await productApi.getProduct(Number(productId));
      setProduct(response.data);
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const loadSales = useCallback(async () => {
    try {
      const response = await salesApi.getSalesByProduct(Number(productId));
      setSales(response.data);
    } catch (err) {
      console.error('Failed to load sales:', err);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
    loadSales();
  }, [loadProduct, loadSales]);

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salesApi.createSale({
        product: Number(productId),
        sales_amount: parseFloat(newSale.sales_amount),
        quantity: parseInt(newSale.quantity),
        customer_name: newSale.customer_name || undefined,
      });
      setNewSale({ sales_amount: '', quantity: '1', customer_name: '' });
      setShowSaleForm(false);
      loadProduct();
      loadSales();
    } catch (err) {
      console.error('Failed to add sale:', err);
      alert('Failed to add sale');
    }
  };

  if (loading) {
    return <div className="product-detail loading">Loading...</div>;
  }

  if (!product) {
    return <div className="product-detail error">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="detail-header">
        <button onClick={() => navigate('/products')} className="back-button">
          ← Back to Products
        </button>
        <h1>{product.product_name}</h1>
      </div>

      <div className="detail-content">
        <div className="info-card">
          <h2>Product Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Product Type:</span>
              <span className="info-value">{product.product_type}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sellable:</span>
              <span className={`sellable-badge ${product.sellable}`}>
                {product.sellable === 'yes' ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Sales:</span>
              <span className="info-value">${product.total_sales?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Orders Count:</span>
              <span className="info-value">{product.sales_count || 0}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {new Date(product.created_at!).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="sales-card">
          <div className="sales-header">
            <h2>Sales History</h2>
            <button 
              onClick={() => setShowSaleForm(!showSaleForm)} 
              className="add-sale-button"
            >
              {showSaleForm ? '✕ Cancel' : '➕ Add Sale'}
            </button>
          </div>

          {showSaleForm && (
            <form onSubmit={handleAddSale} className="sale-form">
              <div className="form-group">
                <label>Sale Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSale.sales_amount}
                  onChange={(e) => setNewSale({ ...newSale, sales_amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={newSale.quantity}
                  onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Customer Name (Optional)</label>
                <input
                  type="text"
                  value={newSale.customer_name}
                  onChange={(e) => setNewSale({ ...newSale, customer_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <button type="submit" className="submit-button">Add Sale</button>
            </form>
          )}

          <div className="sales-list">
            {sales.length === 0 ? (
              <p className="no-sales">No sales recorded yet</p>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.sales_id}>
                      <td>{new Date(sale.sale_date!).toLocaleDateString()}</td>
                      <td>{sale.customer_name || '-'}</td>
                      <td>{sale.quantity}</td>
                      <td>${sale.sales_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
