export type ExpenseCategory = 
  | "Electricity" 
  | "Rent" 
  | "Gas" 
  | "Vehicle" 
  | "Truck Payment" 
  | "Salary" 
  | "Maintenance" 
  | "Raw Material" 
  | "Other";

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidTo?: string;           // e.g. K-Electric, Landlord, Truck Driver name
  paymentMethod?: "Cash" | "Bank Transfer" | "Credit";
}