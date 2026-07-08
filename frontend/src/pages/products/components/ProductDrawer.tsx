import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Product, ProductFormValues, productSchema } from '@/lib/types/product';
import { useCreateProduct, useUpdateProduct } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null; // If null, it's a create action
}

export function ProductDrawer({ open, onOpenChange, product }: ProductDrawerProps) {
  const isEditing = !!product;
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id || '');
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues>({
    // @ts-ignore
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      costPrice: 0,
      sellingPrice: 0,
      minimumStock: 10,
      maximumStock: 100,
      categoryId: '',
    },
  });

  React.useEffect(() => {
    if (product) {
      reset({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        minimumStock: product.minimumStock,
        maximumStock: product.maximumStock,
        categoryId: product.categoryId,
        barcode: product.barcode || '',
      });
    } else {
      reset({
        sku: '',
        name: '',
        description: '',
        costPrice: 0,
        sellingPrice: 0,
        minimumStock: 10,
        maximumStock: 100,
        categoryId: '',
      });
    }
  }, [product, reset, open]);

  const onSubmit = async (data: ProductFormValues) => {
    if (isEditing) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  const [showConfirmClose, setShowConfirmClose] = React.useState(false);

  const handleOpenChange = (openState: boolean) => {
    if (!openState && isDirty && !isSubmitting) {
      setShowConfirmClose(true);
    } else {
      onOpenChange(openState);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
        <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-full sm:w-[540px] rounded-none bg-background/95 backdrop-blur-md shadow-2xl border-l border-border/50">
        <DrawerHeader className="text-left border-b border-border">
          <DrawerTitle>{isEditing ? 'Edit Product' : 'Create New Product'}</DrawerTitle>
          <DrawerDescription>
            {isEditing 
              ? 'Update the product details below.' 
              : 'Add a new product to your inventory catalog.'}
          </DrawerDescription>
          <DrawerClose asChild className="absolute right-4 top-4">
            <Button variant="ghost" size="icon">
              <Icons.close className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        
        {/* We use a custom scroll area here since it can get long */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form id="product-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 pb-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU <span className="text-destructive">*</span></Label>
                <Input id="sku" {...register('sku')} placeholder="PROD-001" />
                {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input id="barcode" {...register('barcode')} placeholder="888123456" />
                {errors.barcode && <p className="text-xs text-destructive">{errors.barcode.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register('name')} placeholder="Wireless Headphones" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} placeholder="Detailed product description..." className="resize-none h-24" />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price <span className="text-destructive">*</span></Label>
                <Input id="costPrice" type="number" step="0.01" {...register('costPrice')} />
                {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price <span className="text-destructive">*</span></Label>
                <Input id="sellingPrice" type="number" step="0.01" {...register('sellingPrice')} />
                {errors.sellingPrice && <p className="text-xs text-destructive">{errors.sellingPrice.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category <span className="text-destructive">*</span></Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger id="categoryId" className={errors.categoryId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumStock">Min Stock</Label>
                <Input id="minimumStock" type="number" {...register('minimumStock')} />
                {errors.minimumStock && <p className="text-xs text-destructive">{errors.minimumStock.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maximumStock">Max Stock</Label>
                <Input id="maximumStock" type="number" {...register('maximumStock')} />
                {errors.maximumStock && <p className="text-xs text-destructive">{errors.maximumStock.message}</p>}
              </div>
            </div>

          </form>
        </div>

        <DrawerFooter className="border-t border-border/50 bg-background/80 backdrop-blur-md pt-4 sticky bottom-0 z-20 pb-8 sm:pb-4 px-4 sm:px-6">
          <Button type="submit" form="product-form" disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md">
            {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    <ConfirmDialog
        open={showConfirmClose}
        onOpenChange={setShowConfirmClose}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        variant="destructive"
        onConfirm={() => {
          setShowConfirmClose(false);
          reset();
          onOpenChange(false);
        }}
      />
    </>
  );
}
