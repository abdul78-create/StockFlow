const fs = require('fs');
const path = require('path');

const routesMap = {
  'user.routes.ts': [
    { find: "authorize(['ADMIN', 'MANAGER'])", replace: "requirePermission('members.view')" },
    { find: "authorize(['ADMIN'])", replace: "requirePermission('members.update')" }, // generic fallback, we'll manually patch invite vs update
  ],
  'supplier.routes.ts': [
    { find: "authorize(['ADMIN', 'MANAGER'])", replace: "requirePermission('suppliers.create')" },
    { find: "authorize(['ADMIN', 'MANAGER'])", replace: "requirePermission('suppliers.update')" }, // this will break if order is wrong, so we use regex per route method
  ],
}

// Actually, instead of blind replacement, let's just do a regex replace on all authorize calls 
// based on the router method or URL.
// But wait, the easiest way is just to manually replace the contents.
// There are only 8 files. 

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace("import { authenticate, authorize }", "import { authenticate, requirePermission }");
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  fs.writeFileSync(filePath, content, 'utf8');
}

const dir = path.join(__dirname, '../src/modules');

replaceInFile(path.join(dir, 'users/user.routes.ts'), [
  { from: "authorize(['ADMIN', 'MANAGER']), controller.getUsers", to: "requirePermission('members.view'), controller.getUsers" },
  { from: "authorize(['ADMIN']),\n  validateRequest", to: "requirePermission('members.invite'),\n  validateRequest" }, // post
  { from: "authorize(['ADMIN']),\n  validateRequest({ params: userIdParamSchema, body: updateUserSchema })", to: "requirePermission('members.update'),\n  validateRequest({ params: userIdParamSchema, body: updateUserSchema })" }, // patch
  { from: "authorize(['ADMIN']),\n  validateRequest({ params: userIdParamSchema }),\n  controller.deleteUser", to: "requirePermission('members.delete'),\n  validateRequest({ params: userIdParamSchema }),\n  controller.deleteUser" }, // delete
  { from: "authorize(['ADMIN']),\n  validateRequest({ params: userIdParamSchema }),\n  controller.restoreUser", to: "requirePermission('members.update'),\n  validateRequest({ params: userIdParamSchema }),\n  controller.restoreUser" }, // restore
]);

replaceInFile(path.join(dir, 'products/product.routes.ts'), [
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: createProductSchema })", to: "requirePermission('products.create'),\n  validateRequest({ body: createProductSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ params: productIdParamSchema, body: updateProductSchema })", to: "requirePermission('products.update'),\n  validateRequest({ params: productIdParamSchema, body: updateProductSchema })" },
  { from: "authorize(['ADMIN']),\n  validateRequest({ params: productIdParamSchema }),\n  controller.deleteProduct", to: "requirePermission('products.delete'),\n  validateRequest({ params: productIdParamSchema }),\n  controller.deleteProduct" },
  { from: "authorize(['ADMIN']),\n  validateRequest({ params: productIdParamSchema }),\n  controller.restoreProduct", to: "requirePermission('products.update'),\n  validateRequest({ params: productIdParamSchema }),\n  controller.restoreProduct" },
]);

replaceInFile(path.join(dir, 'customers/customer.routes.ts'), [
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: createCustomerSchema })", to: "requirePermission('customers.create'),\n  validateRequest({ body: createCustomerSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ params: customerIdParamSchema, body: updateCustomerSchema })", to: "requirePermission('customers.update'),\n  validateRequest({ params: customerIdParamSchema, body: updateCustomerSchema })" },
  { from: "authorize(['ADMIN']),\n  validateRequest({ params: customerIdParamSchema }),\n  controller.deleteCustomer", to: "requirePermission('customers.update'),\n  validateRequest({ params: customerIdParamSchema }),\n  controller.deleteCustomer" },
  { from: "authorize(['ADMIN']),\n  validateRequest({ params: customerIdParamSchema }),\n  controller.restoreCustomer", to: "requirePermission('customers.update'),\n  validateRequest({ params: customerIdParamSchema }),\n  controller.restoreCustomer" },
]);

replaceInFile(path.join(dir, 'suppliers/supplier.routes.ts'), [
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: createSupplierSchema })", to: "requirePermission('suppliers.create'),\n  validateRequest({ body: createSupplierSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ params: supplierIdParamSchema, body: updateSupplierSchema })", to: "requirePermission('suppliers.update'),\n  validateRequest({ params: supplierIdParamSchema, body: updateSupplierSchema })" },
]);

replaceInFile(path.join(dir, 'warehouses/warehouse.routes.ts'), [
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: createWarehouseSchema })", to: "requirePermission('warehouses.create'),\n  validateRequest({ body: createWarehouseSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ params: warehouseIdParamSchema, body: updateWarehouseSchema })", to: "requirePermission('warehouses.update'),\n  validateRequest({ params: warehouseIdParamSchema, body: updateWarehouseSchema })" },
]);

replaceInFile(path.join(dir, 'inventory/inventory.routes.ts'), [
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: adjustStockSchema })", to: "requirePermission('inventory.adjust'),\n  validateRequest({ body: adjustStockSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: transferStockSchema })", to: "requirePermission('inventory.transfer'),\n  validateRequest({ body: transferStockSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: receiveStockSchema })", to: "requirePermission('inventory.transfer'),\n  validateRequest({ body: receiveStockSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: dispatchStockSchema })", to: "requirePermission('inventory.transfer'),\n  validateRequest({ body: dispatchStockSchema })" },
]);

replaceInFile(path.join(dir, 'sales-orders/sales-order.routes.ts'), [
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: createSalesOrderSchema })", to: "requirePermission('sales_orders.create'),\n  validateRequest({ body: createSalesOrderSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ params: salesOrderIdParamSchema, body: updateSalesOrderStatusSchema })", to: "requirePermission('sales_orders.update'),\n  validateRequest({ params: salesOrderIdParamSchema, body: updateSalesOrderStatusSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ params: salesOrderIdParamSchema })", to: "requirePermission('sales_orders.update'),\n  validateRequest({ params: salesOrderIdParamSchema })" },
]);

replaceInFile(path.join(dir, 'purchase-orders/purchase-order.routes.ts'), [
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ body: createPurchaseOrderSchema })", to: "requirePermission('purchase_orders.create'),\n  validateRequest({ body: createPurchaseOrderSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ params: purchaseOrderIdParamSchema, body: updatePurchaseOrderStatusSchema })", to: "requirePermission('purchase_orders.update'),\n  validateRequest({ params: purchaseOrderIdParamSchema, body: updatePurchaseOrderStatusSchema })" },
  { from: "authorize(['ADMIN', 'MANAGER']),\n  validateRequest({ params: purchaseOrderIdParamSchema })", to: "requirePermission('purchase_orders.update'),\n  validateRequest({ params: purchaseOrderIdParamSchema })" },
]);

console.log("Refactoring complete");
