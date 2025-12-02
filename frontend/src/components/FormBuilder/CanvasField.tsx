import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField } from '../../types';

interface CanvasFieldProps {
  field: FormField;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  primaryLanguage: string;
}

const CanvasField: React.FC<CanvasFieldProps> = ({
  field,
  isSelected,
  onClick,
  onDelete,
  primaryLanguage,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getFieldPreview = () => {
    const label = field.labels[primaryLanguage] || 'Untitled Field';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return <input type={field.type} placeholder={label} disabled />;
      case 'textarea':
        return <textarea placeholder={label} disabled />;
      case 'date':
        return <input type="date" disabled />;
      case 'dropdown':
        return (
          <select disabled>
            <option>{label}</option>
            {field.options?.map(opt => (
              <option key={opt.id}>{opt.label[primaryLanguage]}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div>
            {field.options?.map(opt => (
              <label key={opt.id}>
                <input type="radio" name={field.id} disabled />
                {opt.label[primaryLanguage]}
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div>
            {field.options?.map(opt => (
              <label key={opt.id}>
                <input type="checkbox" disabled />
                {opt.label[primaryLanguage]}
              </label>
            ))}
          </div>
        );
      default:
        return <input type="text" placeholder={label} disabled />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-field ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="field-header">
        <span className="drag-handle" {...attributes} {...listeners}>☰</span>
        <span className="field-title">
          {field.labels[primaryLanguage] || 'Untitled Field'}
          {field.required && <span className="required">*</span>}
        </span>
        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          🗑️
        </button>
      </div>
      <div className="field-preview">
        {getFieldPreview()}
      </div>
      {field.descriptions?.[primaryLanguage] && (
        <p className="field-description">{field.descriptions[primaryLanguage]}</p>
      )}
    </div>
  );
};

export default CanvasField;
