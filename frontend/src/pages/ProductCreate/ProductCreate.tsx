import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types/ecommerce';
import { productApi } from '../../services/ecommerceApi';
import './ProductCreate.css';

interface FormSchema {
  schema_id: number;
  form_name: string;
}

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formSchemas, setFormSchemas] = useState<FormSchema[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    product_type: '',
    sellable: 'yes',
    form_schema: undefined,
    custom_fields: {},
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadFormSchemas();
  }, []);

  const loadFormSchemas = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/forms/');
      const data = await response.json();
      const schemas = Array.isArray(data) ? data : (data.results || []);
      setFormSchemas(schemas);
    } catch (err) {
      console.error('Failed to load form schemas:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.product_name || !formData.product_type) {
      setError('Product name and type are required');
      return;
    }

    try {
      const response = await productApi.createProduct({
        ...formData,
        form_schema: formData.form_schema || undefined,
      });
      navigate(`/products/${response.data.product_id}`);
    } catch (err: any) {
      console.error('Failed to create product:', err);
      setError(err.response?.data?.detail || 'Failed to create product');
    }
  };

  return (
    <div className="product-create">
      <div className="create-header">
        <button onClick={() => navigate('/products')} className="back-button">
          ← Back to Products
        </button>
        <h1>Create New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="create-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="product_name">
              Product Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product_type">
              Product Type <span className="required">*</span>
            </label>
            <input
              type="text"
              id="product_type"
              value={formData.product_type}
              onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
              placeholder="e.g., Electronics, Clothing, Books"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sellable">Sellable</label>
            <select
              id="sellable"
              value={formData.sellable}
              onChange={(e) => setFormData({ ...formData, sellable: e.target.value as 'yes' | 'no' })}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Optional Configuration</h2>

          <div className="form-group">
            <label htmlFor="form_schema">Link to Form Schema (Optional)</label>
            <select
              id="form_schema"
              value={formData.form_schema || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                form_schema: e.target.value ? Number(e.target.value) : undefined 
              })}
            >
              <option value="">-- No form schema --</option>
              {formSchemas.map(schema => (
                <option key={schema.schema_id} value={schema.schema_id}>
                  {schema.form_name}
                </option>
              ))}
            </select>
            <p className="help-text">
              Link this product to a custom form for additional fields
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="image_path">Image URL (Optional)</label>
            <input
              type="text"
              id="image_path"
              value={formData.image_path || ''}
              onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/products')} 
            className="cancel-button"
          >
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;
