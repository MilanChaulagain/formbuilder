import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormSchema } from '../../types';
import { formApi } from '../../services/api';
import './Home.css';

const Home: React.FC = () => {
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await formApi.getAllForms();
      // Handle both paginated and non-paginated responses
      const formsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data as any).results || [];
      setForms(formsData);
    } catch (err) {
      console.error('Failed to load forms:', err);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      await formApi.deleteForm(slug);
      setForms(forms.filter(f => f.slug !== slug));
    } catch (err) {
      console.error('Failed to delete form:', err);
      alert('Failed to delete form');
    }
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  };

  if (loading) {
    return <div className="home loading">Loading...</div>;
  }

  return (
    <div className="home">
      <div className="home-header">
        <div>
          <h1>Form Builder Dashboard</h1>
          <p>Create, manage, and analyze your dynamic forms</p>
        </div>
        <Link to="/create" className="create-button">
          ➕ Create New Form
        </Link>
      </div>

      <div className="forms-grid">
        {forms.length === 0 ? (
          <div className="empty-state">
            <h2>No forms yet</h2>
            <p>Create your first form to get started</p>
            <Link to="/create" className="create-button-large">
              Create Form
            </Link>
          </div>
        ) : (
          forms.map(form => (
            <div key={form.id} className="form-card">
              <div className="form-card-header">
                <h3>{form.title}</h3>
                <span className="form-slug">{form.slug}</span>
              </div>

              {form.description && (
                <p className="form-description">{form.description}</p>
              )}

              <div className="form-stats">
                <div className="stat">
                  <span className="stat-label">Fields</span>
                  <span className="stat-value">{form.fields_structure.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Submissions</span>
                  <span className="stat-value">{form.submission_count || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Languages</span>
                  <span className="stat-value">
                    {1 + (form.language_config.optional?.length || 0)}
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <Link to={`/dashboard/${form.slug}`} className="action-btn view-btn">
                  📊 Dashboard
                </Link>
                <button onClick={() => copyLink(form.slug!)} className="action-btn copy-btn">
                  🔗 Copy Link
                </button>
                <button onClick={() => deleteForm(form.slug!)} className="action-btn delete-btn">
                  🗑️ Delete
                </button>
              </div>

              <div className="form-meta">
                Created {new Date(form.created_at!).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
