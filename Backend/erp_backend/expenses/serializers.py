from rest_framework import serializers
from .models import RawMaterial, Supplier, Brand, FinishedGood
from .models import Employee, SalaryTransaction, Expense, Sale, BOM, BOMItem, ProductionBatch

class RawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawMaterial
        fields = '__all__'


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'


class FinishedGoodSerializer(serializers.ModelSerializer):
    brandName = serializers.CharField(source='brand.name', read_only=True)
    
    class Meta:
        model = FinishedGood
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class SalaryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryTransaction
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    brandName = serializers.CharField(source='brand.name', read_only=True)
    
    class Meta:
        model = Sale
        fields = '__all__'

class BOMItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOMItem
        fields = '__all__'

class BOMSerializer(serializers.ModelSerializer):
    items = BOMItemSerializer(many=True, read_only=True) # This nests the items inside the BOM automatically!
    
    class Meta:
        model = BOM
        fields = '__all__'

class ProductionBatchSerializer(serializers.ModelSerializer):
    brandName = serializers.CharField(source='brand.name', read_only=True)
    
    class Meta:
        model = ProductionBatch
        fields = '__all__'