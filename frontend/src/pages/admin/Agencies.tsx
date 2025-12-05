import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/FileUploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, FlaskConical, Loader2, MapPin, Trash2, ExternalLink } from "lucide-react";
import { agenciesApi } from "@/lib/services";
import { TestingAgency } from "@shared/schema";
import { format } from "date-fns";

const agencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  approvalId: z.string().min(1, "Approval ID is required"),
  approvalCertificateFileId: z.string().min(1, "Approval Certificate is required"),
  location: z.string().min(1, "Location is required"),
  agencyType: z.string().min(1, "Agency Type is required"),
});

type AgencyForm = z.infer<typeof agencySchema>;

interface AgencyWithFile extends TestingAgency {
  approvalCertificateFile?: { secureUrl?: string; filename?: string };
}

export default function Agencies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingAgency, setDeletingAgency] = useState<TestingAgency | null>(null);
  const [agencies, setAgencies] = useState<AgencyWithFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAgencies = async () => {
    try {
      setIsLoading(true);
      const data = await agenciesApi.getAgencies() as AgencyWithFile[];
      setAgencies(data);
    } catch (error) {
      // Error fetching agencies
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const form = useForm<AgencyForm>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      approvalId: "",
      approvalCertificateFileId: "",
      location: "",
      agencyType: "Government",
    },
  });

  function handleFileUploaded(fileId: string) {
    setUploadedFileId(fileId);
    form.setValue("approvalCertificateFileId", fileId);
    form.clearErrors("approvalCertificateFileId");
  }

  async function onSubmit(data: AgencyForm) {
    if (!uploadedFileId) {
      form.setError("approvalCertificateFileId", { message: "Approval Certificate is required" });
      return;
    }

    try {
      setIsCreating(true);
      await agenciesApi.createAgency({
        ...data,
        approvalCertificateFileId: uploadedFileId,
      });
      
      toast({ title: "Agency registered successfully" });
      await fetchAgencies();
      setIsDialogOpen(false);
      form.reset();
      setUploadedFileId(null);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to register agency";
      toast({ title: "Failed to register agency", description: message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete() {
    if (!deletingAgency) return;

    try {
      setIsDeleting(true);
      const agencyId = deletingAgency.id || (deletingAgency as any)._id;
      await agenciesApi.deleteAgency(agencyId);
      toast({ title: "Agency deleted successfully" });
      await fetchAgencies();
      setDeletingAgency(null);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to delete agency";
      toast({ title: "Failed to delete agency", description: message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Testing Agencies</h1>
            <p className="text-muted-foreground mt-1">
              Manage registered testing agencies
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-agency">
                <Plus className="h-4 w-4 mr-2" />
                Register Agency
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Testing Agency</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agency Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Agency name" {...field} data-testid="input-agency-name" />
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
                            <Input type="email" placeholder="Login email" {...field} data-testid="input-agency-email" />
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
                            <Input type="password" placeholder="Password" {...field} data-testid="input-agency-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="approvalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval ID <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Approval ID" {...field} data-testid="input-agency-approval-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="approvalCertificateFileId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Certificate (PDF) <span className="text-red-500">*</span></FormLabel>
                        
                        <FileUploader
                          onFileUploaded={handleFileUploaded}
                          accept=".pdf"
                          maxSize={10 * 1024 * 1024}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} data-testid="input-agency-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agencyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agency Type <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Government" id="govt" data-testid="radio-govt" />
                              <Label htmlFor="govt" className="cursor-pointer">Government</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Private" id="private" data-testid="radio-private" />
                              <Label htmlFor="private" className="cursor-pointer">Private</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                     <Button type="submit" disabled={isCreating} data-testid="button-save-agency">
                       {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                       Register Agency
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
            ) : agencies?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Approval ID</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead className="hidden lg:table-cell">Type</TableHead>
                      <TableHead className="hidden lg:table-cell">Location</TableHead>
                      <TableHead className="hidden sm:table-cell">Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agencies.map((agency) => (
                      <TableRow key={agency.id} data-testid={`agency-row-${agency.id}`}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{agency.name}</div>
                            <div className="text-sm text-muted-foreground md:hidden">{agency.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{agency.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{agency.approvalId}</Badge>
                        </TableCell>
                        <TableCell>
                          {agency.approvalCertificateFile?.secureUrl ? (
                            <button
                              className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
                              onClick={() => window.open(agency.approvalCertificateFile?.secureUrl, '_blank')}
                              data-testid={`button-view-cert-${agency.id}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              View
                            </button>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{agency.agencyType || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {agency.location ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {agency.location}
                            </span>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {format(new Date(agency.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingAgency(agency)}
                            title="Delete Agency"
                            data-testid={`button-delete-agency-${agency.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                  <FlaskConical className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No agencies registered</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Register your first testing agency to get started
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Register Agency
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAgency} onOpenChange={(open) => !open && setDeletingAgency(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agency</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingAgency?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}
