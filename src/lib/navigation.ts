import { BellRing, CalendarClock, ChartNoAxesCombined, CircleDollarSign, ClipboardCheck, Fingerprint, LayoutDashboard, Settings2, UsersRound } from "lucide-react";

export const modules = [
  { slug: "dashboard", name: "Dashboard", description: "Company-wide HR insights.", icon: LayoutDashboard },
  { slug: "organization", name: "Organization", description: "Businesses, branches, departments and employees.", icon: UsersRound },
  { slug: "attendance", name: "Attendance", description: "Shifts, grace periods, punches and corrections.", icon: Fingerprint },
  { slug: "requests", name: "Requests & Leave", description: "Leave, WFH, waivers and manager approvals.", icon: ClipboardCheck },
  { slug: "payroll", name: "Payroll", description: "Salary rules, loans, taxes and payslips.", icon: CalendarClock },
  { slug: "finance", name: "Accounts & Finance", description: "Double-entry ledger, invoices and expenses.", icon: CircleDollarSign },
  { slug: "reports", name: "Reports", description: "Operational and financial reporting.", icon: ChartNoAxesCombined },
  { slug: "notifications", name: "Notifications", description: "Web push and workflow alerts.", icon: BellRing },
  { slug: "settings", name: "Settings", description: "Tenant preferences and permissions.", icon: Settings2 },
] as const;
