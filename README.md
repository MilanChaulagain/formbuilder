# Dynamic Form Builder - Proof of Concept

A sophisticated full-stack web application for creating dynamic forms with multi-language support, built with Django and React. This is a "No-Code/Low-Code" platform similar to Typeform, JotForm, or Airtable.

## 🎯 Features

### Core Functionality
- **Dynamic Form Creation**: Build forms with drag-and-drop interface
- **Multi-Language Support**: Mandatory primary language + optional secondary languages
- **Field Types**: Text, Textarea, Number, Email, Date, Dropdown, Radio, Checkbox
- **Form Submissions**: Public form links for data collection
- **Dashboard Analytics**: View submissions with filtering and search
- **Dynamic Schema**: No need to pre-define database tables

### Technical Highlights
- **JSON-based Storage**: PostgreSQL JSONB for flexible schema
- **RESTful API**: Django REST Framework
- **Type-Safe Frontend**: React + TypeScript
- **Drag & Drop**: dnd-kit library
- **Advanced Tables**: TanStack Table (React Table)
- **Responsive Design**: Mobile-friendly UI

## 🏗️ Architecture

### Backend (Django)
```
backend/
├── formbuilder/          # Django project settings
│   ├── settings.py       # Configuration
│   ├── urls.py           # Main URL routing
│   └── wsgi.py           # WSGI application
├── forms_app/            # Main application
│   ├── models.py         # FormSchema & FormSubmission models
│   ├── views.py          # API ViewSets
│   ├── serializers.py    # DRF Serializers
│   ├── urls.py           # App URL routing
│   └── admin.py          # Admin interface
├── manage.py             # Django management script
└── requirements.txt      # Python dependencies
```

### Frontend (React + TypeScript)
```
frontend/
├── public/
│   └── index.html        # HTML template
├── src/
│   ├── components/
│   │   ├── FormBuilder/  # Drag-and-drop builder
│   │   │   ├── FormBuilder.tsx
│   │   │   ├── FieldSidebar.tsx
│   │   │   ├── CanvasField.tsx
│   │   │   ├── PropertyPanel.tsx
│   │   │   └── FormBuilder.css
│   │   ├── FormRenderer/ # Public form display
│   │   │   ├── FormRenderer.tsx
│   │   │   └── FormRenderer.css
│   │   └── Dashboard/    # Analytics dashboard
│   │       ├── Dashboard.tsx
│   │       └── Dashboard.css
│   ├── pages/
│   │   ├── Home/         # List all forms
│   │   │   ├── Home.tsx
│   │   │   └── Home.css
│   │   └── CreateForm/   # Create new form
│   │       ├── CreateForm.tsx
│   │       └── CreateForm.css
│   ├── services/
│   │   └── api.ts        # Axios API client
│   ├── types/
│   │   └── index.ts      # TypeScript definitions
│   ├── App.tsx           # Main App component
│   ├── App.css           # Global styles
│   └── index.tsx         # Entry point
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 📋 Prerequisites

### Backend Requirements
- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

### Frontend Requirements
- Node.js 16+
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
cd "d:\Heramba Ecommerce Project\FormBuilder"
```

### 2. Database Setup

**Create PostgreSQL Database:**
```bash
# Using psql
psql -U postgres
CREATE DATABASE formbuilder_db;
\q
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env file with your database credentials:
# DB_NAME=formbuilder_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432
# SECRET_KEY=your-secret-key-here

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (for admin access)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run on `http://localhost:8000`

### 4. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on `http://localhost:3000`

## 🎮 Usage Guide

### Creating a Form

1. **Navigate to Home**: Open `http://localhost:3000`
2. **Click "Create New Form"**
3. **Configure Form Settings**:
   - Enter form title (required)
   - Add description (optional)
   - Select primary language
   - Add optional languages
4. **Build Form**:
   - Drag field types from left sidebar to canvas
   - Click on a field to edit properties
   - Add labels in all configured languages
   - Set field as required/optional
   - For dropdown/radio/checkbox: add options
5. **Save Form**: Click "💾 Save Form"

### Sharing Forms

1. From the home page, click "🔗 Copy Link"
2. Share the link: `http://localhost:3000/form/{slug}`
3. Users can fill and submit the form without login

### Viewing Submissions

1. From home page, click "📊 Dashboard"
2. View all submissions in a table
3. Use search bar for global search
4. Apply field-specific filters
5. Sort by clicking column headers

## 🔌 API Endpoints

### Form Schema APIs

```
GET    /api/forms/                    # List all forms (user's forms)
POST   /api/forms/                    # Create new form
GET    /api/forms/{slug}/             # Get form by slug
PATCH  /api/forms/{slug}/             # Update form
DELETE /api/forms/{slug}/             # Delete form
GET    /api/forms/{slug}/public/      # Get public form (no auth)
GET    /api/forms/{slug}/submissions/ # Get form submissions with filters
```

### Form Submission APIs

```
POST   /api/submissions/              # Submit form data
GET    /api/submissions/              # List all submissions (user's forms)
GET    /api/submissions/{id}/         # Get specific submission
```

### Example: Create Form

```bash
curl -X POST http://localhost:8000/api/forms/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Customer Feedback",
    "description": "Tell us what you think",
    "language_config": {
      "primary": "en",
      "optional": ["es"]
    },
    "fields_structure": [
      {
        "id": "field_1",
        "type": "text",
        "labels": {"en": "Name", "es": "Nombre"},
        "required": true
      },
      {
        "id": "field_2",
        "type": "dropdown",
        "labels": {"en": "Rating", "es": "Calificación"},
        "required": true,
        "options": [
          {"id": "opt_1", "label": {"en": "Excellent", "es": "Excelente"}},
          {"id": "opt_2", "label": {"en": "Good", "es": "Bueno"}}
        ]
      }
    ],
    "created_by": 1
  }'
```

### Example: Submit Form

```bash
curl -X POST http://localhost:8000/api/submissions/ \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "abc12345",
    "data": {
      "field_1": "John Doe",
      "field_2": "opt_1"
    }
  }'
```

## 🗄️ Database Schema

### FormSchema Model
```python
{
    "id": Integer,
    "title": String,
    "slug": String (unique, 8 chars),
    "description": Text,
    "language_config": JSON {
        "primary": String,
        "optional": Array[String]
    },
    "fields_structure": JSON [
        {
            "id": String,
            "type": String,
            "labels": Object,
            "descriptions": Object,
            "required": Boolean,
            "options": Array (optional)
        }
    ],
    "relationships": JSON Array,
    "created_by": ForeignKey(User),
    "created_at": DateTime,
    "updated_at": DateTime
}
```

### FormSubmission Model
```python
{
    "id": Integer,
    "form_schema": ForeignKey(FormSchema),
    "data": JSON {
        "field_id": value,
        ...
    },
    "submitted_at": DateTime,
    "submitted_by": ForeignKey(User, nullable),
    "ip_address": String
}
```

## 🔧 Configuration

### Backend Configuration (`backend/formbuilder/settings.py`)
- Database: PostgreSQL (required for JSONB)
- CORS: Configured for `http://localhost:3000`
- REST Framework pagination: 50 items per page

### Frontend Configuration
- Proxy: Configured to proxy API requests to `http://localhost:8000`
- API Base URL: Can be changed via `REACT_APP_API_URL` env variable

## 🎨 Customization

### Adding New Field Types

1. **Update TypeScript types** (`frontend/src/types/index.ts`):
```typescript
export type FieldType = 'text' | 'textarea' | 'yournewtype' | ...;
```

2. **Add to FieldSidebar** (`frontend/src/components/FormBuilder/FieldSidebar.tsx`):
```typescript
{ type: 'yournewtype', label: 'Your New Type', icon: '🆕' }
```

3. **Handle in CanvasField** (preview) and **FormRenderer** (actual input)

### Adding Validation Rules

Extend the `FormField` type with validation properties and implement in:
- `FormSubmissionSerializer.validate()` (backend)
- `FormRenderer.handleSubmit()` (frontend)

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Verify PostgreSQL is running
# On Windows (services):
services.msc
# Look for PostgreSQL service

# Check .env credentials match your PostgreSQL setup
```

**Migration Errors:**
```bash
# Reset migrations (development only!)
python manage.py migrate forms_app zero
python manage.py makemigrations
python manage.py migrate
```

### Frontend Issues

**Module Not Found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS Errors:**
- Ensure backend is running on port 8000
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`

## 📦 Production Deployment

### Backend (Django)

1. Set `DEBUG=False` in production
2. Generate secure `SECRET_KEY`
3. Configure allowed hosts: `ALLOWED_HOSTS = ['yourdomain.com']`
4. Use production WSGI server (Gunicorn):
```bash
pip install gunicorn
gunicorn formbuilder.wsgi:application
```
5. Set up PostgreSQL with proper credentials
6. Configure static files serving

### Frontend (React)

1. Build production bundle:
```bash
npm run build
```
2. Serve with nginx or similar
3. Update `REACT_APP_API_URL` to production API URL

## 🚀 Future Enhancements

- [ ] User authentication & authorization
- [ ] Form templates
- [ ] Conditional logic (show/hide fields based on answers)
- [ ] File upload field type
- [ ] Email notifications on submission
- [ ] Export submissions to CSV/Excel
- [ ] Form analytics (charts, graphs)
- [ ] Webhook integrations
- [ ] Form versioning
- [ ] Collaboration features
- [ ] Custom branding/themes

## 📝 License

This is a Proof of Concept project for educational purposes.

## 🤝 Contributing

This is a PoC project. Feel free to fork and extend for your needs.

## 📧 Support

For issues or questions, please check the troubleshooting section above.

---

**Built with ❤️ using Django, React, and PostgreSQL**
