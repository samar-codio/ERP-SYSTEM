import uuid
from django.db import models

class RawMaterial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    stock = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    unit = models.CharField(max_length=20)
    reorder = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    def __str__(self):
        return self.name

class Supplier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    contactPerson = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    totalPurchases = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    outstanding = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    lastPurchaseDate = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name

class Brand(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    contact = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class FinishedGood(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    brandName = models.CharField(max_length=255, blank=True) 
    productId = models.CharField(max_length=100)
    productName = models.CharField(max_length=255)
    stock = models.IntegerField(default=0)
    unit = models.CharField(max_length=50)
    reorderLevel = models.IntegerField(default=500)
    lastUpdated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.productName


# -----------------------------------------
# HR & PAYROLL MODULE
# -----------------------------------------
class Employee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100, null=True, blank=True)
    monthlySalary = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    currentBalance = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    lastSettled = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name

class SalaryTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    employeeName = models.CharField(max_length=255, blank=True)
    date = models.DateField()
    type = models.CharField(max_length=50)  # "Advance", "Payment", "Salary"
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.type} - {self.employeeName}"

# -----------------------------------------
# EXPENSE MODULE
# -----------------------------------------
class Expense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField()
    category = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paidTo = models.CharField(max_length=255, null=True, blank=True)
    paymentMethod = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.description

# -----------------------------------------
# SALES MODULE
# -----------------------------------------
class Sale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.CharField(max_length=255)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    brandName = models.CharField(max_length=255, blank=True)
    productId = models.CharField(max_length=100)
    productName = models.CharField(max_length=255)
    qty = models.IntegerField(default=0)
    unitPrice = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    payment = models.CharField(max_length=50)
    date = models.DateField()

    def __str__(self):
        return f"Sale to {self.customer}"

# -----------------------------------------
# PRODUCTION MODULE
# -----------------------------------------
class BOM(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    productId = models.CharField(max_length=100)

    def __str__(self):
        return f"BOM for {self.productId}"

class BOMItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # The 'related_name="items"' allows React to receive the nested array: items: BOMItem[]
    bom = models.ForeignKey(BOM, related_name='items', on_delete=models.CASCADE)
    rawMaterial = models.ForeignKey(RawMaterial, on_delete=models.CASCADE)
    rawMaterialName = models.CharField(max_length=255, blank=True)
    qtyPerUnit = models.DecimalField(max_digits=10, decimal_places=4)

    def __str__(self):
        return self.rawMaterialName

class ProductionBatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField()
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    brandName = models.CharField(max_length=255, blank=True)
    productId = models.CharField(max_length=100)
    productName = models.CharField(max_length=255)
    qty = models.IntegerField(default=0)
    totalRawConsumed = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Batch {self.id} - {self.productName}"