// src/data/dashboardApi.ts

export async function getDashboardSummary(): Promise<{
  todaysSales: number;
  salesChange: number;
  netProfit: number;
  profitMargin: number;
  finishedGoodsStock: number;
  lowStockAlertsCount: number;
  finishedGoodsFillLevels: Array<{ name: string; current: number; max: number }>;
  rawMaterialAlerts: Array<{ name: string; stock: number; reorderLevel: number }>;
  finishedGoodsAlerts: Array<{ name: string; stock: number; unit: string; reorderLevel: number }>;
}> {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/dashboard/summary");
    if (!response.ok) throw new Error("Failed to fetch dashboard summaries");
    return await response.json();
  } catch (error) {
    console.error("Error loading dashboard metrics:", error);
    // Safe fallbacks matching your beautiful dashboard layout structure
    return {
      todaysSales: 0,
      salesChange: 0,
      netProfit: 0,
      profitMargin: 0,
      finishedGoodsStock: 0,
      lowStockAlertsCount: 0,
      finishedGoodsFillLevels: [],
      rawMaterialAlerts: [],
      finishedGoodsAlerts: []
    };
  }
}