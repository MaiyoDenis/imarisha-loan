# Admin Dashboard - Quick Start Guide

## 🚀 Access the Dashboard

### Main Admin Dashboard
**URL**: `http://localhost:3000/dashboards/admin`

**What you'll see:**
- Product inventory overview (5 metrics)
- Lending analytics (7 metrics)
- Profit analysis with margin calculations
- Repayment performance tracking
- Growth metrics (MTD, QTD, YTD)
- Top 10 performing products table
- Branch comparison across all locations
- System alerts

### Product Management
**URL**: `http://localhost:3000/admin/product-management`

**What you can do:**
- Add new loan products
- Set market price (cost to company)
- Set selling price (customer loan amount)
- Update stock quantities
- View profit margins automatically
- See inventory value totals

---

## 📊 Dashboard Sections Explained

### 1️⃣ Product Inventory Overview
Shows the physical products available for lending:
- **Total Products**: Count of all products
- **Inventory Value**: Total market price × quantity
- **Active Products**: Products currently available
- **Low Stock Alerts**: Products below threshold
- **Market Value**: Total investment in inventory

### 2️⃣ Lending Analytics  
Core loan lending metrics:
- **Active Loans**: Currently disbursed loans
- **Completed Loans**: Fully repaid loans
- **Total Borrowed**: Sum of all loan amounts
- **Total Paid**: Amount customers have repaid
- **Outstanding**: Amount still owed
- **Expected Income**: Interest + fees from active loans
- **Borrowed vs Paid Ratio**: % repayment progress

### 3️⃣ Profit Analysis (Most Important)
Financial performance:
```
COST OF GOODS SOLD = Market Price × Quantity Sold
REVENUE = Selling Price × Quantity Sold  
GROSS PROFIT = Revenue - COGS + Interest + Fees
MARGIN % = (Gross Profit / Revenue) × 100
```

**Example:**
- Market Price: 5,000 | Selling Price: 7,500
- 100 units sold = 500,000 cost | 750,000 revenue
- Interest earned: 360,000
- Gross Profit: 610,000
- Profit Margin: 81.33%

### 4️⃣ Repayment Performance
How well members are repaying:
- **Repayment Rate %**: (Completed / Disbursed) × 100
- **Default Rate %**: Loans that failed
- **Overdue Loans**: Loans past due date
- **Outstanding Balance**: Total unpaid amount

### 5️⃣ Growth Metrics
How fast business is growing:
- **MTD**: This month's new loans
- **QTD**: This quarter's new loans  
- **YTD**: This year's new loans

### 6️⃣ Top Products
Which products are most profitable:
- Product name
- Market price (what you paid)
- Selling price (what customers borrow)
- Loans issued with this product
- Total revenue
- Profit amount
- Margin percentage

### 7️⃣ Branch Comparison
Performance across branches:
- Branch name and location
- Total loans issued
- Total amount disbursed
- Completed loans (repaid)
- Active loans (still out)

---

## 🎯 How Products Work (Product-Based Lending)

### Product Setup Example
```
PRODUCT: Solar Panel System

Market Price (Cost): KES 15,000
Selling Price: KES 18,000
Interest Rate: 15% per 6 months
Duration: 6 months

Customer borrows: 18,000
After 6 months pays back: 18,000 + interest
System profit: (18,000 - 15,000) + interest
```

### Why Two Prices?
- **Market Price**: What you paid the supplier (ADMIN ONLY)
- **Selling Price**: What customer borrows (public)
- **Margin**: The difference = your profit percentage

---

## 📈 Reading the Numbers

### Good Indicators ✅
- Repayment Rate > 80%
- Default Rate < 5%
- Profit Margin > 20%
- Active Loans > Completed Loans (growth)
- No/few overdue loans
- Low stock products < 2

### Warning Indicators ⚠️
- Repayment Rate < 50%
- Default Rate > 10%
- Overdue Loans > 5
- Outstanding Balance growing
- Margin < 10%
- Multiple low stock alerts

### Critical Indicators 🔴
- Repayment Rate < 20%
- Default Rate > 25%
- Overdue Loans > 10
- Negative profit margin
- Stock critically low (0-2 units)

---

## 🔧 Common Tasks

### Add a New Product
1. Go to `/admin/product-management`
2. Click **"Add Product"**
3. Fill in:
   - Product name
   - Category (Energy, Electronics, Agriculture)
   - Market Price (your cost)
   - Selling Price (loan amount)
   - Initial stock
   - Low stock threshold
4. Click **Save Product**

### Check Profit for a Product
1. View the **Top Products** table
2. Look at **Margin %** column
3. Negative margin = losing money
4. Increase selling price or reduce costs

### Monitor Repayment
1. Check **Repayment Rate %** in Repayment section
2. If below 80%, investigate defaulters
3. Review **Overdue Loans** count
4. Take collection action if needed

### Compare Branch Performance
1. Scroll to **Branch Comparison** table
2. Sort by:
   - Total Loans (volume)
   - Total Amount (revenue)
   - Completed Loans (success)
3. Best performing branch: highest completed ratio

### Identify Issues
1. Check **Alerts** at top of dashboard
2. Red alerts = immediate action needed
3. Yellow alerts = monitor closely
4. Green = all good

---

## 💾 Exporting Data

### Export Dashboard
Click **Export** button to download CSV with:
- All metrics
- Branch comparison
- Product performance
- Profit analysis
- Repayment tracking

### Use Cases
- Send to finance team
- Board presentations
- Bank reports
- Compliance documentation
- Monthly reviews

---

## 🔄 Real-Time Updates

### Auto-Refresh
- Dashboard refreshes every 30 seconds
- Data stays current
- No manual refresh needed

### Manual Refresh
- Click **Refresh** button for instant update
- Use before important decisions
- Before exporting for reports

---

## 🔒 Who Can Access?

| Role | Admin Dashboard | Product Mgmt | Can See Costs |
|------|---|---|---|
| Admin | ✅ | ✅ | ✅ |
| Branch Manager | ✅ | ✅ | ✅ |
| Loan Officer | ❌ | ❌ | ❌ |
| Field Officer | ❌ | ❌ | ❌ |
| Member | ❌ | ❌ | ❌ |

---

## 📞 Troubleshooting

### Dashboard Shows "No Data"
**Solution:**
1. Ensure products are created
2. Verify loans are disbursed (not just pending)
3. Check members are linked to branches
4. Wait 5 minutes for cache refresh

### Profit Margin Shows 0% or Negative
**Solution:**
1. Check Market Price < Selling Price
2. Verify interest rates are set
3. Ensure interest is being calculated
4. Check product is linked to loans

### Branch Not Showing in Comparison
**Solution:**
1. Verify branch has active members
2. Check members have loans
3. Ensure loans are not in pending status
4. Refresh dashboard

### Export File is Empty
**Solution:**
1. Ensure data is loaded in dashboard first
2. Check that loans exist in database
3. Try clicking Refresh then Export
4. Check browser console for errors

---

## 📊 Metrics at a Glance

| Metric | Formula | Target |
|--------|---------|--------|
| Repayment Rate | Completed ÷ Disbursed × 100 | > 80% |
| Default Rate | Defaulted ÷ Disbursed × 100 | < 5% |
| Margin % | (Revenue - Cost) ÷ Revenue × 100 | > 20% |
| PAR Ratio | Overdue ÷ Total × 100 | < 10% |
| Cost Benefit | Revenue ÷ Cost | > 1.2 |
| Growth Rate | New Loans MTD ÷ Total × 100 | > 2% |

---

## 🎓 Tips & Tricks

1. **Maximize Profit**: Set selling price 30-40% above market price
2. **Reduce Risk**: Don't lend to members with <60 risk score
3. **Improve Repayment**: Follow up on loans overdue >3 days
4. **Track Trends**: Export monthly and compare growth
5. **Balance Portfolio**: Don't over-concentrate in one product
6. **Monitor Alerts**: Check dashboard daily for alerts
7. **Optimize Stock**: Keep 2-3 months supply on hand
8. **Review Products**: Eliminate products with negative margins

---

## 📱 Mobile Access

The dashboard is responsive and works on:
- ✅ Desktop (recommended for full view)
- ✅ Tablet (most features work)
- ✅ Mobile (limited view, use for quick checks)

---

## 🆘 Need Help?

### Check These First
1. Is the backend API running?
2. Are you logged in as admin?
3. Does your browser console show errors?
4. Are there active loans in the system?

### Verify Data Flow
1. Create a product
2. Create a member
3. Offer a loan with that product
4. Approve and disburse the loan
5. Dashboard should show in Lending Analytics

### Report Issues
- Check browser console (F12)
- Note the exact error message
- Check network tab for API responses
- Verify backend logs

---

## 🚀 Next Steps

1. **Set Up Products**: Add all your loan products
2. **Configure Pricing**: Set market and selling prices
3. **Monitor Dashboard**: Check daily for insights
4. **Review Reports**: Export monthly metrics
5. **Take Action**: Use alerts to improve operations

---

**Your admin dashboard is now ready to manage the complete loan product business!** 📊✨
