import React from 'react';
import { FieldType } from '../../types';

interface FieldSidebarProps {
  onAddField: (type: FieldType) => void;
}

const fieldTypes: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'textarea', label: 'Text Area', icon: '📄' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'dropdown', label: 'Dropdown', icon: '🔽' },
  { type: 'radio', label: 'Radio Button', icon: '⚪' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
];

const FieldSidebar: React.FC<FieldSidebarProps> = ({ onAddField }) => {
  return (
    <div className="field-sidebar">
      <h3>Form Elements</h3>
      <div className="field-list">
        {fieldTypes.map(fieldType => (
          <button
            key={fieldType.type}
            className="field-button"
            onClick={() => onAddField(fieldType.type)}
          >
            <span className="field-icon">{fieldType.icon}</span>
            <span className="field-label">{fieldType.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FieldSidebar;
