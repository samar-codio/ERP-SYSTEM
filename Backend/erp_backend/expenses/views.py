from rest_framework import viewsets
from .models import RawMaterial, Supplier, Brand, FinishedGood
from .serializers import (
    RawMaterialSerializer, SupplierSerializer, 
    BrandSerializer, FinishedGoodSerializer
)
from .models import Employee, SalaryTransaction, Expense, Sale, BOM, BOMItem, ProductionBatch
from .serializers import (
    EmployeeSerializer, SalaryTransactionSerializer, ExpenseSerializer, 
    SaleSerializer, BOMSerializer, BOMItemSerializer, ProductionBatchSerializer
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, F
from django.utils import timezone

class RawMaterialViewSet(viewsets.ModelViewSet):
    queryset = RawMaterial.objects.all()
    serializer_class = RawMaterialSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class FinishedGoodViewSet(viewsets.ModelViewSet):
    queryset = FinishedGood.objects.all()
    serializer_class = FinishedGoodSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

class SalaryTransactionViewSet(viewsets.ModelViewSet):
    queryset = SalaryTransaction.objects.all()
    serializer_class = SalaryTransactionSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    
    def perform_create(self, serializer):
        # Save the sale
        sale = serializer.save()
        
        # Deduct from finished goods stock
        try:
            finished_good = FinishedGood.objects.filter(
                brand=sale.brand,
                productId=sale.productId
            ).first()
            
            if finished_good:
                finished_good.stock -= sale.qty
                finished_good.save()
            else:
                print(f"Warning: Finished good not found for sale {sale.id}")
        except Exception as e:
            print(f"Error deducting finished goods stock: {e}")

class BOMViewSet(viewsets.ModelViewSet):
    queryset = BOM.objects.all()
    serializer_class = BOMSerializer

class BOMItemViewSet(viewsets.ModelViewSet):
    queryset = BOMItem.objects.all()
    serializer_class = BOMItemSerializer

class ProductionBatchViewSet(viewsets.ModelViewSet):
    queryset = ProductionBatch.objects.all()
    serializer_class = ProductionBatchSerializer
    
    def perform_create(self, serializer):
        # Save the production batch
        batch = serializer.save()
        
        # Update finished goods stock
        try:
            finished_good = FinishedGood.objects.filter(
                brand=batch.brand,
                productId=batch.productId
            ).first()
            
            if finished_good:
                finished_good.stock += batch.qty
                finished_good.save()
            else:
                # Create new finished good entry if it doesn't exist
                FinishedGood.objects.create(
                    brand=batch.brand,
                    brandName=batch.brandName,
                    productId=batch.productId,
                    productName=batch.productName,
                    stock=batch.qty,
                    unit="units"
                )
        except Exception as e:
            print(f"Error updating finished goods stock: {e}")
        
        # Deduct raw materials based on BOM
        try:
            bom = BOM.objects.filter(productId=batch.productId).first()
            if bom:
                for bom_item in bom.items.all():
                    raw_material = bom_item.rawMaterial
                    total_qty_needed = bom_item.qtyPerUnit * batch.qty
                    raw_material.stock -= total_qty_needed
                    raw_material.save()
                    print(f"Deducted {total_qty_needed} {raw_material.unit} from {raw_material.name}")
        except Exception as e:
            print(f"Error deducting raw materials: {e}")



#TESTING FOR DASHBOARD
from django.db.models import Sum, F
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.utils import timezone
from .models import Sale, Expense, FinishedGood, RawMaterial, SalaryTransaction

@api_view(['GET'])
def dashboard_summary(request):
    try:
        today = timezone.now().date()
        current_month = today.month
        current_year = today.year

        # 1. Today's Sales
        todays_sales = Sale.objects.filter(date=today).aggregate(total=Sum('amount'))['total'] or 0

        # 2. Net Profit
        monthly_sales = Sale.objects.filter(date__month=current_month, date__year=current_year).aggregate(total=Sum('amount'))['total'] or 0
        monthly_expenses = Expense.objects.filter(date__month=current_month, date__year=current_year).aggregate(total=Sum('amount'))['total'] or 0
        monthly_salaries = SalaryTransaction.objects.filter(date__month=current_month, date__year=current_year).aggregate(total=Sum('amount'))['total'] or 0
        
        total_costs = monthly_expenses + monthly_salaries
        net_profit = monthly_sales - total_costs
        profit_margin = round((net_profit / monthly_sales * 100)) if monthly_sales > 0 else 0

        # 3. Finished Goods
        all_finished_goods = FinishedGood.objects.all()
        total_fg_stock = all_finished_goods.aggregate(total=Sum('stock'))['total'] or 0

        fill_levels = []
        for fg in all_finished_goods:
            fill_levels.append({
                "name": fg.productName,
                "stock": fg.stock,
                "capacity": 5000 # Default if no capacity field exists
            })

        # 4. Raw Material Alerts (Fixed: used 'reorder' field)
        low_stock_materials = RawMaterial.objects.filter(stock__lte=F('reorder'))
        raw_alerts = []
        for rm in low_stock_materials:
            raw_alerts.append({
                "name": rm.name,
                "stock": rm.stock,
                "unit": rm.unit,
                "reorderLevel": rm.reorder
            })

        # 4.5. Finished Goods Low Stock Alerts
        low_stock_finished_goods = FinishedGood.objects.filter(stock__lte=F('reorderLevel'))
        fg_alerts = []
        for fg in low_stock_finished_goods:
            fg_alerts.append({
                "name": fg.productName,
                "stock": fg.stock,
                "unit": fg.unit,
                "reorderLevel": fg.reorderLevel
            })

        # 5. Live Activity from all sources
        activity_log = []
        
        # Recent sales
        recent_sales = Sale.objects.order_by('-date')[:3]
        for sale in recent_sales:
            activity_log.append({
                "type": "Sale",
                "party": sale.customer, 
                "desc": f"{sale.productName} x {sale.qty}",
                "date": sale.date.strftime("%Y-%m-%d") if sale.date else "Today",
                "amount": float(sale.amount)
            })
        
        # Recent expenses
        recent_expenses = Expense.objects.order_by('-date')[:2]
        for exp in recent_expenses:
            activity_log.append({
                "type": "Expense",
                "party": exp.paidTo or exp.category,
                "desc": exp.description,
                "date": exp.date.strftime("%Y-%m-%d") if exp.date else "Today",
                "amount": -float(exp.amount)  # Negative for expenses
            })
        
        # Sort by date and take top 5
        activity_log.sort(key=lambda x: x['date'], reverse=True)
        activity_log = activity_log[:5]

        return Response({
            "todaysSales": float(todays_sales),
            "salesChange": 12,
            "netProfit": float(net_profit),
            "profitMargin": profit_margin,
            "finishedGoodsStock": total_fg_stock,
            "lowStockAlertsCount": len(raw_alerts) + len(fg_alerts),
            "finishedGoodsFillLevels": fill_levels,
            "rawMaterialAlerts": raw_alerts,
            "finishedGoodsAlerts": fg_alerts,
            "recentActivity": activity_log
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# LEDGER ENDPOINT
@api_view(['GET'])
def ledger_entries(request):
    try:
        # Get all transactions from different sources
        sales = Sale.objects.all().order_by('-date')
        expenses = Expense.objects.all().order_by('-date')
        salaries = SalaryTransaction.objects.all().order_by('-date')
        
        ledger = []
        
        # Add sales as credit entries
        for sale in sales:
            ledger.append({
                "id": str(sale.id),
                "date": sale.date.isoformat(),
                "type": "Sale",
                "description": f"{sale.productName} x {sale.qty} to {sale.customer}",
                "party": sale.customer,
                "debit": 0,
                "credit": float(sale.amount),
                "running_balance": 0  # Will be calculated
            })
        
        # Add expenses as debit entries
        for expense in expenses:
            ledger.append({
                "id": str(expense.id),
                "date": expense.date.isoformat(),
                "type": "Expense",
                "description": expense.description,
                "party": expense.paidTo or expense.category,
                "debit": float(expense.amount),
                "credit": 0,
                "running_balance": 0
            })
        
        # Add salary transactions
        for salary in salaries:
            ledger.append({
                "id": str(salary.id),
                "date": salary.date.isoformat(),
                "type": salary.type,
                "description": f"{salary.type} - {salary.employeeName}",
                "party": salary.employeeName,
                "debit": float(salary.amount) if salary.type in ["Advance", "Salary"] else 0,
                "credit": float(salary.amount) if salary.type == "Payment" else 0,
                "running_balance": 0
            })
        
        # Sort by date
        ledger.sort(key=lambda x: x['date'], reverse=True)
        
        # Calculate running balance
        balance = 0
        for entry in reversed(ledger):
            balance += entry['credit'] - entry['debit']
            entry['running_balance'] = balance
        
        # Reverse back to show newest first
        ledger.reverse()
        
        return Response(ledger)
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)