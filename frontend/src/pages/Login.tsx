// src/pages/Login.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FlaskConical, Shield, Building2, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type UserType = "ADMIN" | "MSME" | "AGENCY";

const userTypeConfig: Record<UserType, { label: string; description: string; icon: React.ReactNode; redirect: string }> = {
  ADMIN: { label: "Admin", description: "Association administrators", icon: <Shield className="h-5 w-5" />, redirect: "/admin" },
  MSME: { label: "MSME", description: "Micro, Small & Medium Enterprises", icon: <Building2 className="h-5 w-5" />, redirect: "/msme" },
  AGENCY: { label: "Agency", description: "Testing agencies", icon: <FlaskConical className="h-5 w-5" />, redirect: "/agency" },
};

export default function Login() {
  const [userType, setUserType] = useState<UserType>("ADMIN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginForm) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log('Login attempt:', { email: data.email, userType });
    try {
      await login(data.email, data.password, userType);
      // do not navigate here — effect below handles redirect when auth state updates
    } catch (error: any) {
      console.error('Login error:', error);
      toast({ title: "Login failed", description: error?.message ?? "Invalid credentials", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      // ensure user.type is normalized to lowercase route
      const t = (user.type as string || '').toLowerCase();
      const redirect = userTypeConfig[(t.toUpperCase() as UserType)]?.redirect ?? `/${t}`;
      setLocation(redirect);
    }
  }, [isAuthenticated, user, setLocation]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FlaskConical className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">MotorTest</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to MotorTest</CardTitle>
            <CardDescription>Product testing management for associations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                {(Object.keys(userTypeConfig) as UserType[]).map((type) => (
                  <TabsTrigger key={type} value={type} className="gap-2" data-testid={`tab-${type.toLowerCase()}`}>
                    {userTypeConfig[type].icon}
                    <span className="hidden sm:inline">{userTypeConfig[type].label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center pb-2">{userTypeConfig[userType].description}</p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-login">
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Sign In as {userTypeConfig[userType].label}
                    </Button>
                  </form>
                </Form>
              </div>
            </Tabs>

            <div className="mt-4 text-center border-t text-sm text-muted-foreground">
              <p className="pt-3">Need an account? Contact your association administrator</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
