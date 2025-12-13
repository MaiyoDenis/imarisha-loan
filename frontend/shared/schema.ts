import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, decimal, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // admin, branch_manager, loan_officer, procurement_officer, customer
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  branchId: integer("branch_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Branches
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  managerId: integer("manager_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBranchSchema = createInsertSchema(branches).omit({ id: true, createdAt: true });
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branches.$inferSelect;

// Groups (8 members each)
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  branchId: integer("branch_id").notNull(),
  loanOfficerId: integer("loan_officer_id").notNull(),
  maxMembers: integer("max_members").default(8).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true });
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

// Members/Customers
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  groupId: integer("group_id"),
  memberCode: text("member_code").notNull().unique(),
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }).default("800").notNull(),
  registrationFeePaid: boolean("registration_fee_paid").default(false).notNull(),
  status: text("status").default("pending").notNull(), // pending, active, blocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMemberSchema = createInsertSchema(members).omit({ id: true, createdAt: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

// Savings Account (per member)
export const savingsAccounts = pgTable("savings_accounts", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  accountNumber: text("account_number").notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavingsAccountSchema = createInsertSchema(savingsAccounts).omit({ id: true, createdAt: true });
export type InsertSavingsAccount = z.infer<typeof insertSavingsAccountSchema>;
export type SavingsAccount = typeof savingsAccounts.$inferSelect;

// Drawdown Account (per member)
export const drawdownAccounts = pgTable("drawdown_accounts", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  accountNumber: text("account_number").notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDrawdownAccountSchema = createInsertSchema(drawdownAccounts).omit({ id: true, createdAt: true });
export type InsertDrawdownAccount = z.infer<typeof insertDrawdownAccountSchema>;
export type DrawdownAccount = typeof drawdownAccounts.$inferSelect;

// Product Categories
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductCategorySchema = createInsertSchema(productCategories).omit({ id: true, createdAt: true });
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = typeof productCategories.$inferSelect;

// Loan Products (Physical items)
export const loanProducts = pgTable("loan_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
  buyingPrice: decimal("buying_price", { precision: 10, scale: 2 }).notNull(), // Secret (admin only)
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(), // Principle
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(10).notNull(),
  criticalStockThreshold: integer("critical_stock_threshold").default(5).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoanProductSchema = createInsertSchema(loanProducts).omit({ id: true, createdAt: true });
export type InsertLoanProduct = z.infer<typeof insertLoanProductSchema>;
export type LoanProduct = typeof loanProducts.$inferSelect;

// Loan Types (Terms and conditions)
export const loanTypes = pgTable("loan_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(), // e.g., 2.00 for 2%
  interestType: text("interest_type").default("flat").notNull(), // flat, reducing, compound
  chargeFeePercentage: decimal("charge_fee_percentage", { precision: 5, scale: 2 }).default("4").notNull(), // 4% of principle
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }).notNull(),
  durationMonths: integer("duration_months").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoanTypeSchema = createInsertSchema(loanTypes).omit({ id: true, createdAt: true });
export type InsertLoanType = z.infer<typeof insertLoanTypeSchema>;
export type LoanType = typeof loanTypes.$inferSelect;

// Loans
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  loanNumber: text("loan_number").notNull().unique(),
  memberId: integer("member_id").notNull(),
  loanTypeId: integer("loan_type_id").notNull(),
  principleAmount: decimal("principle_amount", { precision: 12, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 12, scale: 2 }).notNull(),
  chargeFee: decimal("charge_fee", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  outstandingBalance: decimal("outstanding_balance", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(), // pending, approved, disbursed, active, completed, defaulted
  applicationDate: timestamp("application_date").defaultNow().notNull(),
  approvalDate: timestamp("approval_date"),
  disbursementDate: timestamp("disbursement_date"),
  dueDate: timestamp("due_date"),
  approvedBy: integer("approved_by"),
  disbursedBy: integer("disbursed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoanSchema = createInsertSchema(loans).omit({ id: true, createdAt: true, applicationDate: true });
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

// Loan Products Mapping (which products are in a loan)
export const loanProductItems = pgTable("loan_product_items", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoanProductItemSchema = createInsertSchema(loanProductItems).omit({ id: true, createdAt: true });
export type InsertLoanProductItem = z.infer<typeof insertLoanProductItemSchema>;
export type LoanProductItem = typeof loanProductItems.$inferSelect;

// Transactions (All financial movements)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  memberId: integer("member_id").notNull(),
  accountType: text("account_type").notNull(), // savings, drawdown
  transactionType: text("transaction_type").notNull(), // deposit, withdrawal, loan_disbursement, loan_repayment, transfer, registration_fee
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  reference: text("reference"),
  loanId: integer("loan_id"),
  processedBy: integer("processed_by"),
  mpesaCode: text("mpesa_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(), // loan, member, group, product, etc.
  entityId: integer("entity_id"),
  description: text("description").notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
