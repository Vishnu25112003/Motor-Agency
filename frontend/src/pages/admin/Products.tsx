import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { productsApi } from "@/lib/services";
import { Product } from "@shared/schema";
import { format } from "date-fns";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
});

type ProductForm = z.infer<typeof productSchema>;

export default function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productsApi.getProducts() as Product[];
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
    },
  });

  async function onSubmit(data: ProductForm) {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, data);
        toast({ title: "Product updated successfully" });
        setEditingProduct(null);
      } else {
        await productsApi.createProduct(data);
        toast({ title: "Product created successfully" });
      }
      
      await fetchProducts();
      setIsDialogOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to save product";
      toast({ 
        title: editingProduct ? "Failed to update product" : "Failed to create product", 
        description: message, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteProduct(id: string) {
    try {
      setIsDeleting(id);
      await productsApi.deleteProduct(id);
      toast({ title: "Product deleted successfully" });
      await fetchProducts();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to delete product";
      toast({ title: "Failed to delete product", description: message, variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  }

  function openCreateDialog() {
    setEditingProduct(null);
    form.reset({ name: "", category: "", description: "" });
    setIsDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      category: product.category || "",
      description: product.description || "",
    });
    setIsDialogOpen(true);
  }



  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage products available for testing
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} data-testid="button-add-product">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Product name" {...field} data-testid="input-product-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Product category" {...field} data-testid="input-product-category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea placeholder="Product description" {...field} data-testid="input-product-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} data-testid="button-save-product">
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingProduct ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : products?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {product.description || "-"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(product.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            data-testid={`button-edit-product-${product.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => deleteProduct(product.id)}
                             disabled={isDeleting === product.id}
                             data-testid={`button-delete-product-${product.id}`}
                           >
                             {isDeleting === product.id ? (
                               <Loader2 className="h-4 w-4 animate-spin" />
                             ) : (
                               <Trash2 className="h-4 w-4" />
                             )}
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No products yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first product to get started
                </p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
