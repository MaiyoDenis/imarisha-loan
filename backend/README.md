# Imarisha Loan Backend

This is the Flask backend for the Imarisha Loan management system.

## Setup

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   FLASK_APP=run.py
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://user:password@localhost/imarisha_db
   ```
   (Adjust `DATABASE_URL` as needed. If not provided, it defaults to SQLite `imarisha.db`)

4. Initialize the database:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

## Running the Server

```bash
python run.py
```

The server will start on `http://localhost:5000`.

## API Endpoints

- Auth: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Dashboard: `/api/dashboard/stats`
- Branches: `/api/branches`
- Groups: `/api/groups`
- Members: `/api/members`
- Loan Products: `/api/loan-products`
- Loan Types: `/api/loan-types`
- Loans: `/api/loans`
- Transactions: `/api/transactions`
