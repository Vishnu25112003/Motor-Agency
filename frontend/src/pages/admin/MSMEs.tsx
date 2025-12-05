import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building2, Loader2, Mail, Phone } from "lucide-react";
import { msmeApi } from "@/lib/services";
import { MSME } from "@shared/schema";
import { format } from "date-fns";

const msmeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  governmentApprovalId: z.string().min(1, "Government Approval ID is required"),
  productCategory: z.string().min(1, "Product Category is required"),
  contactEmail: z.string().email("Valid contact email is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
});

type MSMEForm = z.infer<typeof msmeSchema>;

export default function MSMEs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [msmes, setMsmes] = useState<MSME[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMSMEs = async () => {
      try {
        setIsLoading(true);
        const data = await msmeApi.getMSMEs() as MSME[];
        setMsmes(data);
      } catch (error) {
        console.error('Failed to fetch MSMEs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMSMEs();
  }, []);

  const form = useForm<MSMEForm>({
    resolver: zodResolver(msmeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      governmentApprovalId: "",
      productCategory: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  async function onSubmit(data: MSMEForm) {
    try {
      setIsCreating(true);
      await msmeApi.createMSME(data);
      
      // Refresh the list
      const updatedMSMEs = await msmeApi.getMSMEs() as MSME[];
      setMsmes(updatedMSMEs);
      
      toast({ title: "MSME registered successfully" });
      setIsDialogOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to register MSME";
      toast({ title: "Failed to register MSME", description: message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">MSMEs</h1>
            <p className="text-muted-foreground mt-1">
              Manage registered micro, small & medium enterprises
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-msme">
                <Plus className="h-4 w-4 mr-2" />
                Register MSME
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Register New MSME</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="MSME name" {...field} data-testid="input-msme-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Login Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Login email" {...field} data-testid="input-msme-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Password" {...field} data-testid="input-msme-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="governmentApprovalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Government Approval ID <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Approval ID" {...field} data-testid="input-msme-approval-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Category <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Product category" {...field} data-testid="input-msme-category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Contact email" {...field} data-testid="input-msme-contact-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} data-testid="input-msme-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                     <Button type="submit" disabled={isCreating} data-testid="button-save-msme">
                       {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                       Register MSME
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
            ) : msmes?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Approval ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {msmes.map((msme) => (
                    <TableRow key={msme.id} data-testid={`msme-row-${msme.id}`}>
                      <TableCell className="font-medium">{msme.name}</TableCell>
                      <TableCell>{msme.email}</TableCell>
                      <TableCell>{msme.governmentApprovalId || "-"}</TableCell>
                      <TableCell>{msme.productCategory || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          {msme.contactEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {msme.contactEmail}
                            </span>
                          )}
                          {msme.contactPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {msme.contactPhone}
                            </span>
                          )}
                          {!msme.contactEmail && !msme.contactPhone && "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(msme.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No MSMEs registered</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Register your first MSME to get started
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Register MSME
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
