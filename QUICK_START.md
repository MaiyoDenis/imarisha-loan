# ⚡ Quick Start Guide - 5 Minutes

> Get **Imarisha Loan System** running locally in 5 minutes

---

## 🎯 What You'll Get

✅ Backend API running on `http://localhost:5000`  
✅ Frontend running on `http://localhost:3000` (or 5173)  
✅ Pre-populated database with:
- 4 branches
- 31 staff members (admin, loan officers, field officers, procurement officers)
- 32 customers in 4 groups
- Ready-to-use test accounts

---

## 🚀 Auto Start (Recommended)

### Linux/Mac

```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Windows

```bash
start-dev.bat
```

That's it! Both servers will start automatically.

---

## 📖 Manual Start

### 1. Backend (Terminal 1)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py
python run.py
```

✅ Backend ready at: **http://localhost:5000**

### 2. Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend ready at: **http://localhost:3000** or **http://localhost:5173**

---

## 🔑 Login Credentials

Copy & paste these into the login form:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Loan Officer** | `james.mutua` | `officer123` |
| **Field Officer** | `field.john.kipchoge` | `officer123` |
| **Procurement Officer** | `procurement.thomas.kipchoge` | `officer123` |
| **Customer** | `member.0.0` | `customer123` |

---

## ✨ What Works Now

| Feature | Status |
|---------|--------|
| Login/Logout | ✅ Ready |
| Dashboard | ✅ Ready |
| User Management | ✅ Ready |
| Branches | ✅ Ready |
| Groups & Members | ✅ Ready |
| Loan Products | ✅ Ready |
| Test Data | ✅ 32 members ready |
| All Roles | ✅ Created |

---

## 🐛 Troubleshooting

### "Cannot connect to API"
```bash
# Check backend is running
curl http://localhost:5000/api

# Should see: {"name": "Imarisha Loan Management API", ...}
```

### "Port already in use"
```bash
# Backend on different port
python run.py --port 5001

# Frontend (.env.local) update to:
VITE_API_URL=http://localhost:5001/api
```

### "Database error"
```bash
cd backend
rm imarisha.db  # Delete old database
python seed.py  # Create new one
```

### "Module not found"
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📂 Project Structure

```
imarisha-loan/
├── backend/
│   ├── seed.py           ← Creates test data (4 branches, 32 members, etc.)
│   ├── run.py            ← Start backend
│   └── requirements.txt
├── frontend/
│   ├── client/
│   │   └── src/
│   │       └── lib/
│   │           ├── api.ts        ← API configuration (localhost:5000)
│   │           └── auth.ts       ← Login functions
│   └── package.json
├── LOCAL_SETUP.md         ← Detailed documentation
├── CHANGES_SUMMARY.md     ← What changed
├── start-dev.sh          ← Auto-start (Mac/Linux)
└── start-dev.bat         ← Auto-start (Windows)
```

---

## 📊 Test Data Breakdown

### Users Created
- 1 Admin
- 8 Loan Officers (2 per branch)
- 12 Field Officers (3 per branch)
- 4 Procurement Officers
- 32 Customers

### Data Created
- 4 Branches
- 4 Groups (with 8 members each)
- 64 Accounts (savings + drawdown)
- 8 Loan Products
- 4 Loan Types

---

## 🎓 Next Steps

1. **Test Different Roles**
   ```
   Try logging in as Admin, Loan Officer, Customer
   Check what each role can see/do
   ```

2. **Explore Features**
   - Dashboard
   - Branches Management
   - Groups & Members
   - Loan Products
   - View Members

3. **Check API Docs**
   ```
   Open: http://localhost:5000/api
   ```

4. **Read Full Documentation**
   ```
   Read: LOCAL_SETUP.md (detailed guide)
   ```

---

## 💾 Reset Database

Want to start over?

```bash
cd backend
rm imarisha.db
python seed.py
```

---

## ⚙️ Configuration

### API URL
**File:** `frontend/client/.env.local`
```
VITE_API_URL=http://localhost:5000/api
```

### Database
**File:** `backend/.env` (create if needed)
```
DATABASE_URL=sqlite:///imarisha.db
FLASK_ENV=development
```

---

## 📞 API Endpoints

### Core
- `GET /api` - API info
- `GET /health` - Health check

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Main Resources
- `GET /api/branches` - All branches
- `GET /api/groups` - All groups
- `GET /api/members` - All members
- `GET /api/loan-products` - Loan products
- `GET /api/loans` - Loans

---

## ✅ Checklist

Before you start:
- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Git cloned or files available

After starting:
- [ ] Backend running: `http://localhost:5000/api` shows JSON
- [ ] Frontend running: Can see login page
- [ ] Can login with `admin` / `admin123`
- [ ] Dashboard loads without errors

---

## 🎉 You're Ready!

```
Frontend:  http://localhost:3000 (or 5173)
Backend:   http://localhost:5000
Admin:     admin / admin123
```

**Happy testing!** 🚀

---

## 📚 More Info

- **Detailed Setup:** `LOCAL_SETUP.md`
- **What Changed:** `CHANGES_SUMMARY.md`
- **API Docs:** http://localhost:5000/api

