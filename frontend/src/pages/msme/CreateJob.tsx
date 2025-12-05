import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUploader } from "@/components/FileUploader";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { jobsApi, productsApi } from "@/lib/services";
import { Product } from "@shared/schema";

const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  productId: z.string().min(1, "Product is required"),
  detailsFileId: z.string().min(1, "Supporting document is required"),
});

type CreateJobForm = z.infer<typeof createJobSchema>;

export default function CreateJob() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await productsApi.getProducts() as Product[];
        setProducts(data);
      } catch (error) {
        // Error fetching products
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const form = useForm<CreateJobForm>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      description: "",
      productId: "",
      detailsFileId: "",
    },
  });

  async function onSubmit(data: CreateJobForm) {
    if (!uploadedFileId) {
      form.setError("detailsFileId", { message: "Supporting document is required" });
      return;
    }
    
    try {
      setIsCreating(true);
      await jobsApi.createJob({
        ...data,
        productId: data.productId,
        detailsFileId: uploadedFileId,
      });
      
      toast({ title: "Job created successfully" });
      setLocation("/msme/jobs");
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to create job";
      toast({ title: "Failed to create job", description: message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  }

  function handleFileUploaded(fileId: string, filename: string) {
    setUploadedFileId(fileId);
    form.setValue("detailsFileId", fileId);
    form.clearErrors("detailsFileId");
  }

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <Link href="/msme/jobs">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Create New Job</h1>
          <p className="text-muted-foreground mt-1">
            Submit a new product for testing
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productsLoading ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : products?.length ? (
                            products.map((product) => {
                              const productId = product.id || (product as any)._id;
                              return (
                                <SelectItem key={productId} value={productId.toString()}>
                                  {product.name}
                                  {product.category && ` (${product.category})`}
                                </SelectItem>
                              );
                            })
                          ) : (
                            <SelectItem value="no-products" disabled>No products available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a descriptive title for this testing job"
                          {...field}
                          data-testid="input-job-title"
                        />
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
                        <Textarea
                          placeholder="Provide additional details about the testing requirements"
                          className="min-h-24"
                          {...field}
                          data-testid="input-job-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detailsFileId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supporting Document (PDF) <span className="text-red-500">*</span></FormLabel>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload relevant documents for the testing agency
                      </p>
                      <FileUploader
                        onFileUploaded={handleFileUploaded}
                        accept=".pdf"
                        maxSize={10 * 1024 * 1024}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Link href="/msme/jobs">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isCreating} data-testid="button-create-job">
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Job
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
