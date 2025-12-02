import React from 'react';
import { FormField, LanguageConfig, FieldOption } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface PropertyPanelProps {
  field: FormField | undefined;
  languageConfig: LanguageConfig;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  field,
  languageConfig,
  onUpdate,
  onClose,
}) => {
  if (!field) {
    return (
      <div className="property-panel">
        <p className="no-selection">Select a field to edit its properties</p>
      </div>
    );
  }

  const allLanguages = [languageConfig.primary, ...languageConfig.optional];

  const updateLabel = (lang: string, value: string) => {
    onUpdate({
      labels: { ...field.labels, [lang]: value },
    });
  };

  const updateDescription = (lang: string, value: string) => {
    onUpdate({
      descriptions: { ...field.descriptions, [lang]: value },
    });
  };

  const addOption = () => {
    const newOption: FieldOption = {
      id: uuidv4(),
      label: { [languageConfig.primary]: 'New Option' },
    };
    onUpdate({
      options: [...(field.options || []), newOption],
    });
  };

  const updateOption = (optionId: string, lang: string, value: string) => {
    onUpdate({
      options: field.options?.map(opt =>
        opt.id === optionId
          ? { ...opt, label: { ...opt.label, [lang]: value } }
          : opt
      ),
    });
  };

  const deleteOption = (optionId: string) => {
    onUpdate({
      options: field.options?.filter(opt => opt.id !== optionId),
    });
  };

  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(field.type);

  return (
    <div className="property-panel">
      <div className="panel-header">
        <h3>Field Properties</h3>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="panel-content">
        <div className="form-group">
          <label>Field Type</label>
          <input type="text" value={field.type} disabled />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
            />
            Required Field
          </label>
        </div>

        <div className="form-section">
          <h4>Labels</h4>
          {allLanguages.map(lang => (
            <div key={lang} className="form-group">
              <label>
                {lang.toUpperCase()} 
                {lang === languageConfig.primary && <span className="primary-badge">Primary</span>}
              </label>
              <input
                type="text"
                value={field.labels[lang] || ''}
                onChange={(e) => updateLabel(lang, e.target.value)}
                placeholder={`Label in ${lang}`}
              />
            </div>
          ))}
        </div>

        <div className="form-section">
          <h4>Descriptions (Optional)</h4>
          {allLanguages.map(lang => (
            <div key={lang} className="form-group">
              <label>{lang.toUpperCase()}</label>
              <textarea
                value={field.descriptions?.[lang] || ''}
                onChange={(e) => updateDescription(lang, e.target.value)}
                placeholder={`Description in ${lang}`}
                rows={2}
              />
            </div>
          ))}
        </div>

        {hasOptions && (
          <div className="form-section">
            <h4>Options</h4>
            {field.options?.map((option) => (
              <div key={option.id} className="option-group">
                {allLanguages.map(lang => (
                  <div key={lang} className="form-group">
                    <label>{lang.toUpperCase()}</label>
                    <div className="option-input-group">
                      <input
                        type="text"
                        value={option.label[lang] || ''}
                        onChange={(e) => updateOption(option.id, lang, e.target.value)}
                        placeholder={`Option in ${lang}`}
                      />
                      {lang === languageConfig.primary && (
                        <button
                          className="delete-option-btn"
                          onClick={() => deleteOption(option.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button className="add-option-btn" onClick={addOption}>
              + Add Option
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;
