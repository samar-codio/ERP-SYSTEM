from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import dashboard_summary

from .views import (
    RawMaterialViewSet, SupplierViewSet, BrandViewSet, FinishedGoodViewSet,
    EmployeeViewSet, SalaryTransactionViewSet, ExpenseViewSet, SaleViewSet, 
    BOMViewSet, BOMItemViewSet, ProductionBatchViewSet, dashboard_summary, ledger_entries
)

router = DefaultRouter()
router.register(r'rawmaterials', RawMaterialViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'finishedgoods', FinishedGoodViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'salarytransactions', SalaryTransactionViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'boms', BOMViewSet)
router.register(r'bomitems', BOMItemViewSet)
router.register(r'productionbatches', ProductionBatchViewSet)


urlpatterns = [
    path('dashboard/summary', dashboard_summary, name='dashboard-summary'),
    path('ledger/', ledger_entries, name='ledger-entries'),
    
    path('', include(router.urls)), 
]



