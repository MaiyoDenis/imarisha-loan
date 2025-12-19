# Vercel Environment Variables Setup - Checklist

## 🎯 Critical: You MUST Do This Step Manually on Vercel

The code fixes have been applied, but you need to set environment variables on Vercel for them to work.

---

## ✅ Step-by-Step

### **1. Go to Vercel Dashboard**
```
https://vercel.com/dashboard
```

### **2. Select Your Project**
- Click on **imarisha-loans** project

### **3. Go to Settings**
- Click **Settings** tab at the top
- Select **Environment Variables** from left menu

### **4. Add First Variable**
```
Name:         VITE_API_URL
Value:        https://imarisha-loans.onrender.com/api
Environments: Select "Production"
Click:        Save
```

### **5. Add Second Variable**
```
Name:         VITE_BACKEND_URL
Value:        https://imarisha-loans.onrender.com/api
Environments: Select "Production"
Click:        Save
```

### **6. Add Third Variable (Optional)**
```
Name:         VITE_ENV
Value:        production
Environments: Select "Production"
Click:        Save
```

### **7. Trigger Redeploy**
Go to **Deployments** tab:
- Find the latest deployment
- Click the **...** (three dots)
- Click **Redeploy**
- Wait 2-3 minutes for rebuild

---

## 📸 Visual Reference

**Environment Variables Page Should Look Like:**
```
Environment Variables

Name              Value                                          
VITE_API_URL      https://imarisha-loans.onrender.com/api      ✓
VITE_BACKEND_URL  https://imarisha-loans.onrender.com/api      ✓
VITE_ENV          production                                     ✓
```

---

## 🚀 After Setup

### Test the dashboards:
```
https://imarisha-loans.vercel.app/dashboards/executive
https://imarisha-loans.vercel.app/dashboards/operations
https://imarisha-loans.vercel.app/dashboards/risk
https://imarisha-loans.vercel.app/dashboards/member-analytics
https://imarisha-loans.vercel.app/dashboards/forecast
https://imarisha-loans.vercel.app/dashboards/ai-analytics
```

### Verify in browser console (F12):
You should see:
```
[API] Configuration: {
  'API Base': 'https://imarisha-loans.onrender.com/api',
  'VITE_API_URL': 'https://imarisha-loans.onrender.com/api',
  'Mode': 'production',
  'Dev': false
}
```

---

## ⚠️ Common Issues

### Issue: "Still redirects to login"
**Fix:** 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Do hard refresh (Ctrl+Shift+R)
3. Check Render backend is running

### Issue: "Environment variables not updating"
**Fix:**
1. Wait 2-3 minutes after setting variables
2. Click **Redeploy** in Deployments
3. Check that variables show "Production" environment

### Issue: "404 on API calls"
**Fix:**
1. Verify variables are saved (they should show checkmark ✓)
2. Verify Render backend is running: `curl https://imarisha-loans.onrender.com/api/health`
3. Redeploy on Vercel again

---

## 📝 Summary

| Step | Action | Done? |
|------|--------|-------|
| 1 | Go to Vercel dashboard | ☐ |
| 2 | Add VITE_API_URL variable | ☐ |
| 3 | Add VITE_BACKEND_URL variable | ☐ |
| 4 | Add VITE_ENV variable | ☐ |
| 5 | Redeploy on Vercel | ☐ |
| 6 | Test dashboards | ☐ |
| 7 | Verify in browser console | ☐ |

---

## 🎉 Done!

Once you've completed these steps, all dashboards should work without refreshing or redirecting!

**Questions?** See `QUICK_DEPLOYMENT_FIX.md` or `DASHBOARD_FIX_GUIDE.md` for detailed help.
