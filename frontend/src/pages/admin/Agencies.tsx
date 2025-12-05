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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, FlaskConical, Loader2, MapPin } from "lucide-react";
import { agenciesApi } from "@/lib/services";
import { TestingAgency } from "@shared/schema";
import { format } from "date-fns";

const agencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  approvalId: z.string().min(1, "Approval ID is required"),
  location: z.string().min(1, "Location is required"),
  agencyType: z.string().min(1, "Agency Type is required"),
});

type AgencyForm = z.infer<typeof agencySchema>;

export default function Agencies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agencies, setAgencies] = useState<TestingAgency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setIsLoading(true);
        const data = await agenciesApi.getAgencies() as TestingAgency[];
        setAgencies(data);
      } catch (error) {
        console.error('Failed to fetch agencies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const form = useForm<AgencyForm>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      approvalId: "",
      location: "",
      agencyType: "",
    },
  });

  async function onSubmit(data: AgencyForm) {
    try {
      setIsCreating(true);
      await agenciesApi.createAgency(data);
      
      // Refresh the list
      const updatedAgencies = await agenciesApi.getAgencies() as TestingAgency[];
      setAgencies(updatedAgencies);
      
      toast({ title: "Agency registered successfully" });
      setIsDialogOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to register agency";
      toast({ title: "Failed to register agency", description: message, variant: "destructive" });
    } finally {
      setIsCreating(false);
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
            <DialogContent className="max-w-lg">
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
                  <div className="grid grid-cols-2 gap-4">
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
                            <Input placeholder="e.g., Government, Private" {...field} data-testid="input-agency-type" />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Approval ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencies.map((agency) => (
                    <TableRow key={agency.id} data-testid={`agency-row-${agency.id}`}>
                      <TableCell className="font-medium">{agency.name}</TableCell>
                      <TableCell>{agency.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{agency.approvalId}</Badge>
                      </TableCell>
                      <TableCell>{agency.agencyType || "-"}</TableCell>
                      <TableCell>
                        {agency.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {agency.location}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(agency.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
    </DashboardShell>
  );
}
