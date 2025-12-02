import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormSchema, FormSubmissionData } from '../../types';
import { formApi, submissionApi } from '../../services/api';
import './FormRenderer.css';

const FormRenderer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<FormSubmissionData>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  useEffect(() => {
    loadForm();
  }, [slug]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const response = await formApi.getPublicForm(slug!);
      setFormSchema(response.data);
      setCurrentLanguage(response.data.language_config.primary);
      setError(null);
    } catch (err) {
      setError('Form not found');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formSchema) return;

    // Validate required fields
    const missingFields = formSchema.fields_structure
      .filter(field => field.required && !formData[field.id])
      .map(field => field.labels[currentLanguage]);

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      await submissionApi.submitForm(slug!, formData);
      setSubmitted(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const label = field.labels[currentLanguage] || field.labels[formSchema!.language_config.primary];
    const description = field.descriptions?.[currentLanguage];
    const value = formData[field.id] || '';

    const commonProps = {
      value,
      onChange: (e: any) => handleInputChange(field.id, e.target.value),
      required: field.required,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            {...commonProps}
            className="form-input"
            placeholder={label}
          />
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            className="form-input"
            placeholder={label}
            rows={4}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            {...commonProps}
            className="form-input"
          />
        );

      case 'dropdown':
        return (
          <select {...commonProps} className="form-input">
            <option value="">Select {label}</option>
            {field.options?.map((opt: any) => (
              <option key={opt.id} value={opt.id}>
                {opt.label[currentLanguage] || opt.label[formSchema!.language_config.primary]}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((opt: any) => (
              <label key={opt.id} className="radio-label">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.id}
                  checked={value === opt.id}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                />
                {opt.label[currentLanguage] || opt.label[formSchema!.language_config.primary]}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {field.options?.map((opt: any) => (
              <label key={opt.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(value as string[])?.includes(opt.id) || false}
                  onChange={(e) => {
                    const currentValues = (value as string[]) || [];
                    const newValues = e.target.checked
                      ? [...currentValues, opt.id]
                      : currentValues.filter((v: string) => v !== opt.id);
                    handleInputChange(field.id, newValues);
                  }}
                />
                {opt.label[currentLanguage] || opt.label[formSchema!.language_config.primary]}
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="form-renderer loading">Loading form...</div>;
  }

  if (error && !formSchema) {
    return <div className="form-renderer error">{error}</div>;
  }

  if (submitted) {
    return (
      <div className="form-renderer success">
        <div className="success-message">
          <h2>✓ Form Submitted Successfully!</h2>
          <p>Thank you for your submission.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-renderer">
      <div className="form-container">
        <div className="form-header">
          <h1>{formSchema!.title}</h1>
          {formSchema!.description && <p className="form-description">{formSchema!.description}</p>}
          
          {formSchema!.language_config.optional.length > 0 && (
            <div className="language-selector">
              <label>Language: </label>
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
              >
                <option value={formSchema!.language_config.primary}>
                  {formSchema!.language_config.primary.toUpperCase()}
                </option>
                {formSchema!.language_config.optional.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {formSchema!.fields_structure.map(field => (
            <div key={field.id} className="form-field">
              <label className="field-label">
                {field.labels[currentLanguage] || field.labels[formSchema!.language_config.primary]}
                {field.required && <span className="required">*</span>}
              </label>
              
              {field.descriptions?.[currentLanguage] && (
                <p className="field-description">{field.descriptions[currentLanguage]}</p>
              )}
              
              {renderField(field)}
            </div>
          ))}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormRenderer;
