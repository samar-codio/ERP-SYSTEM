import type { Employee, SalaryTransaction } from "../models/Employee";

const API_BASE = "http://127.0.0.1:8000/api";

export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API_BASE}/employees/`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export async function createEmployee(employee: Omit<Employee, "id">): Promise<Employee> {
  const payload: any = { ...employee };

  if (!payload.lastSettled || String(payload.lastSettled).length !== 10) {
    payload.lastSettled = null;
  }

  const res = await fetch(`${API_BASE}/employees/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create employee");
  return res.json();
}

export async function updateEmployee(employee: Employee): Promise<Employee> {
  const payload: any = { ...employee };

  if (!payload.lastSettled || String(payload.lastSettled).length !== 10) {
    payload.lastSettled = null;
  }

  const res = await fetch(`${API_BASE}/employees/${employee.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update employee");
  return res.json();
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/employees/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete employee");
}

export async function getTransactions(): Promise<SalaryTransaction[]> {
  try {
    const res = await fetch(`${API_BASE}/salarytransactions/`);
    if (!res.ok) throw new Error("Failed to fetch salary transactions");
    const data = await res.json();
    console.log("Raw transactions data from API:", data);
    // Transform API response to match frontend model
    const transformed = data.map((item: any) => ({
      id: String(item.id),
      employeeId: String(item.employeeId || item.employee || item.employee_id),
      employeeName: item.employeeName || item.employee_name,
      date: item.date,
      type: item.type,
      amount: Number(item.amount),
      notes: item.notes,
    }));
    console.log("Transformed transactions:", transformed);
    return transformed;
  } catch (error) {
    console.error("Error fetching salary transactions:", error);
    return [];
  }
}

export async function addTransaction(transaction: Omit<SalaryTransaction, "id">): Promise<SalaryTransaction> {
  // Force the date into strict YYYY-MM-DD format for Django
  const cleanDate = transaction.date.includes('T') 
    ? transaction.date.split('T')[0] 
    : transaction.date;

  const payload: any = { 
    ...transaction, 
    employee: transaction.employeeId,
    date: cleanDate
  };

  const res = await fetch(`${API_BASE}/salarytransactions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    // If it fails again, this will print exactly what Django is complaining about in your browser console!
    const errorData = await res.json().catch(() => ({}));
    console.error("Django validation error:", errorData);
    throw new Error("Failed to add salary transaction");
  }
  return res.json();
}

export async function settleMonthly(employeeId: string): Promise<any> {
  // 1. Fetch the current employee from Django
  const empRes = await fetch(`${API_BASE}/employees/${employeeId}/`);
  if (!empRes.ok) throw new Error("Failed to fetch employee");
  const employee = await empRes.json();

  // 2. Update their settled date to today, and reset their balance to 0
  const payload = { 
    ...employee, 
    lastSettled: new Date().toISOString().split('T')[0],
    currentBalance: 0 
  };

  // 3. Send the updated record back to Django
  const updateRes = await fetch(`${API_BASE}/employees/${employeeId}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!updateRes.ok) throw new Error("Failed to settle employee");
  return updateRes.json();
}