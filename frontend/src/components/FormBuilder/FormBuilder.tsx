import React, { useState } from 'react';
import { FormField, FieldType, LanguageConfig } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import FieldSidebar from './FieldSidebar';
import CanvasField from './CanvasField';
import PropertyPanel from './PropertyPanel';
import './FormBuilder.css';

interface FormBuilderProps {
  languageConfig: LanguageConfig;
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ 
  languageConfig, 
  fields, 
  onFieldsChange 
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      labels: { [languageConfig.primary]: `New ${type} field` },
      descriptions: {},
      required: false,
      options: type === 'dropdown' || type === 'radio' || type === 'checkbox' 
        ? [{ id: uuidv4(), label: { [languageConfig.primary]: 'Option 1' } }]
        : undefined,
    };
    
    onFieldsChange([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onFieldsChange(
      fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const deleteField = (fieldId: string) => {
    onFieldsChange(fields.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id);
      const newIndex = fields.findIndex(f => f.id === over.id);
      onFieldsChange(arrayMove(fields, oldIndex, newIndex));
    }
  };

  return (
    <div className="form-builder">
      <FieldSidebar onAddField={addField} />
      
      <div className="form-canvas">
        <h2>Form Canvas</h2>
        {fields.length === 0 ? (
          <div className="empty-canvas">
            <p>Drag and drop fields from the left sidebar to start building your form</p>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map(field => (
                <CanvasField
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  onDelete={() => deleteField(field.id)}
                  primaryLanguage={languageConfig.primary}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <PropertyPanel
        field={selectedField}
        languageConfig={languageConfig}
        onUpdate={(updates) => selectedField && updateField(selectedField.id, updates)}
        onClose={() => setSelectedFieldId(null)}
      />
    </div>
  );
};

export default FormBuilder;
