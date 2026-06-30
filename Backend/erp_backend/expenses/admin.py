from django.contrib import admin

from expenses.models import Brand, Employee, Expense, FinishedGood, ProductionBatch, RawMaterial, SalaryTransaction, Supplier, Sale, BOM, BOMItem  

# Register your models here.
admin.site.register(RawMaterial)
admin.site.register(Supplier)
admin.site.register(Brand)
admin.site.register(FinishedGood)   
admin.site.site_header = "ERP Admin"
admin.site.site_title = "ERP Admin Portal"
admin.site.index_title = "Welcome to ERP Admin Portal"
admin.site.register(Employee)
admin.site.register(SalaryTransaction)
admin.site.register(Expense)    
admin.site.register(Sale)
admin.site.register(BOM)
admin.site.register(BOMItem)