# 🚀 Local Development Setup Guide

> **Working Locally First** - Test everything locally before deploying to production

---

## 📋 Prerequisites

- **Python 3.8+** (Backend)
- **Node.js 18+** (Frontend)
- **PostgreSQL 12+** or **SQLite** (Database)
- **Redis** (for caching) - Optional for local testing

---

## 🛠️ Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Environment Variables

Create a `.env` file in `backend/`:

```env
# Database
DATABASE_URL=sqlite:///imarisha.db
# Or use PostgreSQL:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/imarisha_loan

# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
```

### 5. Initialize Database

```bash
# Create tables
flask db upgrade

# OR initialize from scratch
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 6. Seed Database with Test Data

```bash
python seed.py
```

**Expected output:**
```
🌱 Seeding database with comprehensive test data...

📍 Creating branches...
✓ Created 4 branches

👥 Creating users with all roles...
✓ Admin created
✓ Created 8 loan officers
✓ Created 12 field officers
✓ Created 4 procurement officers

📦 Creating product categories...
✓ Created product categories

🛍️  Creating loan products...
✓ Created 8 loan products

💰 Creating loan types...
✓ Created 4 loan types

👥 Creating 4 groups with 8 members each...
✓ Created 4 groups
   ✓ Created 32 members (8 per group)

💳 Creating savings and drawdown accounts...
✓ Created savings and drawdown accounts for 32 members

======================================================================
✅ DATABASE SEEDED SUCCESSFULLY!
======================================================================

📋 TEST LOGIN CREDENTIALS:
----------------------------------------------------------------------
Admin                admin                          admin123
Loan Officer         james.mutua                    officer123
Field Officer        field.john.kipchoge            officer123
Procurement Officer  procurement.thomas.kipchoge    officer123
Customer             member.0.0                     customer123
----------------------------------------------------------------------

📊 CREATED STATISTICS:
Branches:              4
Loan Officers:         8
Field Officers:        12
Procurement Officers:  4
Groups:                4
Members:               32
Accounts:              64 (savings + drawdown)
Loan Types:            4
Loan Products:         8
----------------------------------------------------------------------

✨ Ready to test locally at http://localhost:5000 and http://localhost:3000
```

### 7. Run Backend Server

```bash
python run.py
```

Backend will be available at: **http://localhost:5000**

Test it:
```bash
curl http://localhost:5000/api
```

---

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

The `.env.local` is already configured for local development:

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

### 4. Run Development Server

```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173** (or http://localhost:3000)

---

## 🧪 Testing Login

### Test Accounts

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Loan Officer** | `james.mutua` | `officer123` |
| **Field Officer** | `field.john.kipchoge` | `officer123` |
| **Procurement Officer** | `procurement.thomas.kipchoge` | `officer123` |
| **Customer** | `member.0.0` | `customer123` |

### Steps to Test

1. Open **http://localhost:3000** in your browser
2. Click **Sign In**
3. Enter credentials (e.g., `admin` / `admin123`)
4. You should see the dashboard

**If you get errors:**
- Check browser console for API errors (F12 → Console)
- Check backend logs for errors
- Ensure backend is running on `http://localhost:5000`

---

## 📊 Database Structure

### Created Data

```
4 Branches
├── Nairobi Main
├── Mombasa Branch
├── Kisumu Branch
└── Nakuru Branch

8 Loan Officers (2 per branch)
12 Field Officers (3 per branch)
4 Procurement Officers (1 per branch)

4 Groups (with 8 members each = 32 members total)
├── Nairobi Business Group A (8 members)
├── Nairobi Business Group B (8 members)
├── Mombasa Business Group (8 members)
└── Kisumu Business Group (8 members)

For each member:
├── Savings Account
└── Drawdown Account

8 Loan Products
4 Loan Types
```

---

## 🔄 Common Commands

### Backend

```bash
# Run server
python run.py

# Run with custom port
python run.py --port 5001

# Reset database (WARNING: Deletes all data)
flask db downgrade base  # or specific revision
python seed.py

# Check database
python -c "from app import db; from app.models import User; print(User.query.all())"
```

### Frontend

```bash
# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error: `ModuleNotFoundError: No module named 'app'`**
```bash
# Ensure you're in backend directory
cd backend
# Ensure venv is activated
source venv/bin/activate
```

**Error: `No such file or directory: 'imarisha.db'`**
```bash
# Reinitialize database
rm imarisha.db  # Delete old database
flask db upgrade  # Create new one
python seed.py  # Populate with test data
```

### Frontend Won't Connect to Backend

**Error: `POST http://localhost:5000/api/auth/login 500`**
1. Check backend is running: `curl http://localhost:5000/api`
2. Check `.env.local` has correct API URL
3. Check backend logs for specific error

**Error: `CORS Error`**
1. Ensure backend is running with CORS enabled (it is by default)
2. Restart backend and frontend

### Database Issues

**Reset everything:**
```bash
cd backend
rm imarisha.db
flask db upgrade
python seed.py
```

---

## 📱 API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Dashboards

- `GET /api/dashboards/executive` - Executive dashboard
- `GET /api/dashboards/operations` - Operations dashboard
- `GET /api/dashboards/risk` - Risk dashboard
- `GET /api/dashboards/member-analytics` - Member analytics

### Resources

- `GET/POST /api/branches` - Branches
- `GET/POST /api/groups` - Groups
- `GET/POST /api/members` - Members
- `GET/POST /api/loans` - Loans
- `GET/POST /api/loan-products` - Loan products
- `GET/POST /api/transactions` - Transactions

---

## 🚀 Next Steps

1. ✅ **Local Testing** - Test all features locally
2. ✅ **Data Validation** - Verify seeded data is correct
3. ✅ **API Integration** - Test all API endpoints
4. ⏭️ **Production Deployment** - Deploy to Render, Vercel, etc.

---

## 📝 Notes

- **Default database**: SQLite (`imarisha.db`)
- **For PostgreSQL**: Update `DATABASE_URL` in `.env`
- **API docs**: Available at `http://localhost:5000/api`
- **Health check**: `http://localhost:5000/health`

