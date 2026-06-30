import type { Expense } from "../models/Expense";

const API_BASE = "http://127.0.0.1:8000/api";

export async function getExpenses(): Promise<Expense[]> {
  try {
    const res = await fetch(`${API_BASE}/expenses/`);
    if (!res.ok) throw new Error("Failed to fetch expenses");
    const data = await res.json();
    console.log("Raw expenses data from API:", data);
    // Transform API response to match Expense interface
    const transformed = data.map((item: any) => ({
      id: String(item.id),
      date: item.date,
      category: item.category,
      description: item.description,
      amount: Number(item.amount),
      paidTo: item.paidTo || item.paid_to,
      paymentMethod: item.paymentMethod || item.payment_method,
    }));
    console.log("Transformed expenses:", transformed);
    return transformed;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

export async function createExpense(expense: Omit<Expense, "id">): Promise<Expense> {
  // 1. Force the date to YYYY-MM-DD format
  const cleanDate = expense.date.includes('T')
    ? expense.date.split('T')[0]
    : expense.date;

  // 2. Ensure amount is a number (sometimes forms send it as a string)
  const payload = {
    ...expense,
    date: cleanDate,
    amount: Number(expense.amount)
  };

  const res = await fetch(`${API_BASE}/expenses/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // This logs the actual validation error from Django to your console
    const errorData = await res.json().catch(() => ({}));
    console.error("Django validation error:", errorData);
    throw new Error("Failed to create expense: " + JSON.stringify(errorData));
  }

  return res.json();
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses/${expense.id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error("Failed to update expense");
  return res.json();
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/expenses/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete expense");
}