import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { FormSchema, FormSubmission } from '../../types';
import { formApi } from '../../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [fieldFilters, setFieldFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schemaRes, submissionsRes] = await Promise.all([
        formApi.getFormBySlug(slug!),
        formApi.getFormSubmissions(slug!),
      ]);
      setFormSchema(schemaRes.data);
      setSubmissions(submissionsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filters: any = {};
      
      if (globalFilter) {
        filters.search = globalFilter;
      }

      Object.entries(fieldFilters).forEach(([fieldId, value]) => {
        if (value) {
          filters[`filter_${fieldId}`] = value;
        }
      });

      const response = await formApi.getFormSubmissions(slug!, filters);
      setSubmissions(response.data);
    } catch (err) {
      console.error('Failed to apply filters:', err);
    }
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setFieldFilters({});
    loadData();
  };

  // Build dynamic columns from form schema
  const columns = React.useMemo<ColumnDef<FormSubmission>[]>(() => {
    if (!formSchema) return [];

    const dynamicColumns: ColumnDef<FormSubmission>[] = formSchema.fields_structure.map(field => ({
      accessorKey: `data.${field.id}`,
      header: field.labels[formSchema.language_config.primary],
      accessorFn: (row: FormSubmission) => {
        const value = row.data[field.id];
        
        // Handle arrays (checkbox values)
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        
        // Handle option-based fields (dropdown, radio)
        if (field.options && value) {
          const option = field.options.find(opt => opt.id === value);
          return option?.label[formSchema.language_config.primary] || value;
        }
        
        return value || '-';
      },
    }));

    return [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 70,
      },
      ...dynamicColumns,
      {
        accessorKey: 'submitted_at',
        header: 'Submitted At',
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
        size: 180,
      },
    ];
  }, [formSchema]);

  const table = useReactTable({
    data: submissions,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return <div className="dashboard loading">Loading dashboard...</div>;
  }

  if (!formSchema) {
    return <div className="dashboard error">Form not found</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{formSchema.title} - Dashboard</h1>
        <p className="submission-count">Total Submissions: {submissions.length}</p>
      </div>

      <div className="filter-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search across all fields..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="search-input"
          />
          <button onClick={applyFilters} className="filter-btn">
            🔍 Search
          </button>
        </div>

        <div className="field-filters">
          <h3>Filter by Fields</h3>
          <div className="filter-grid">
            {formSchema.fields_structure.map(field => (
              <div key={field.id} className="filter-item">
                <label>{field.labels[formSchema.language_config.primary]}</label>
                <input
                  type="text"
                  placeholder={`Filter by ${field.labels[formSchema.language_config.primary]}`}
                  value={fieldFilters[field.id] || ''}
                  onChange={(e) => setFieldFilters(prev => ({
                    ...prev,
                    [field.id]: e.target.value
                  }))}
                />
              </div>
            ))}
          </div>
          <div className="filter-actions">
            <button onClick={applyFilters} className="apply-btn">Apply Filters</button>
            <button onClick={clearFilters} className="clear-btn">Clear All</button>
          </div>
        </div>
      </div>

      <div className="table-container">
        {submissions.length === 0 ? (
          <div className="no-data">No submissions found</div>
        ) : (
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                      className={header.column.getCanSort() ? 'sortable' : ''}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="sort-indicator">
                          {header.column.getIsSorted() === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
