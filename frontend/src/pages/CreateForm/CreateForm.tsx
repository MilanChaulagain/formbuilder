import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormSchema, LanguageConfig, FormField } from '../../types';
import { formApi } from '../../services/api';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import './CreateForm.css';

const CreateForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [languageConfig, setLanguageConfig] = useState<LanguageConfig>({
    primary: 'en',
    optional: [],
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLanguage = (lang: string) => {
    if (lang && !languageConfig.optional.includes(lang)) {
      setLanguageConfig(prev => ({
        ...prev,
        optional: [...prev.optional, lang],
      }));
    }
  };

  const removeLanguage = (lang: string) => {
    setLanguageConfig(prev => ({
      ...prev,
      optional: prev.optional.filter(l => l !== lang),
    }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Form title is required');
      return;
    }

    if (fields.length === 0) {
      setError('Add at least one field to the form');
      return;
    }

    // Validate that all fields have labels in the primary language
    const missingLabels = fields.filter(
      field => !field.labels[languageConfig.primary]
    );

    if (missingLabels.length > 0) {
      setError('All fields must have a label in the primary language');
      return;
    }

    try {
      setSaving(true);
      const formData: Partial<FormSchema> = {
        title,
        description,
        language_config: languageConfig,
        fields_structure: fields,
        relationships: [],
        created_by: 1, // TODO: Replace with actual user ID from auth
      };

      const response = await formApi.createForm(formData);
      navigate(`/dashboard/${response.data.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-form-page">
      <div className="page-header">
        <h1>Create New Form</h1>
        <button onClick={handleSave} className="save-button" disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Form'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="form-settings">
        <div className="settings-card">
          <h2>Form Settings</h2>
          
          <div className="form-group">
            <label>Form Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter form description (optional)"
              className="form-input"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Primary Language *</label>
            <select
              value={languageConfig.primary}
              onChange={(e) => setLanguageConfig(prev => ({ ...prev, primary: e.target.value }))}
              className="form-input"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className="form-group">
            <label>Optional Languages</label>
            <div className="language-tags">
              {languageConfig.optional.map(lang => (
                <span key={lang} className="language-tag">
                  {lang.toUpperCase()}
                  <button onClick={() => removeLanguage(lang)}>✕</button>
                </span>
              ))}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addLanguage(e.target.value);
                  e.target.value = '';
                }
              }}
              className="form-input"
              defaultValue=""
            >
              <option value="">Add a language...</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      <FormBuilder
        languageConfig={languageConfig}
        fields={fields}
        onFieldsChange={setFields}
      />
    </div>
  );
};

export default CreateForm;
