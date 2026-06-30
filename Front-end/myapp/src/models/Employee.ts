export interface Employee {
  id: string;
  name: string;
  role?: string;           // e.g. Line Operator, Helper, Manager
  monthlySalary: number;
  currentBalance: number;  // positive = advance liya hua (company ka qarz), negative = company ne zyada diya
  lastSettled?: string;    // last monthly clear date
  phone?: string;
}

export interface SalaryTransaction {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: "Advance" | "Payment" | "Salary";
  amount: number;
  notes?: string;
}