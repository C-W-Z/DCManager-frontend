"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/use-user";
import { user_schema } from "@/lib/type";
import { getUserRole } from "@/lib/api";

const formSchema = user_schema.pick({ username: true }).extend({
  password: z.string(),
});

export function LoginPage() {
  const { login } = useUser();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    getUserRole(values.username)
      .then((user) => {
        login(user.username, user.role);
        toast.success("Successfully logged in as " + user.username + " (" + user.role + ")");

        if (user.role === "admin") {
          navigate("/overview");
        } else {
          navigate("/service");
        }
      })
      .catch((e) => {
        toast.error("Invalid username or password");
        console.error(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader className="mb-2">
            <CardTitle className="flex justify-center text-xl">Login</CardTitle>
            <CardDescription className="flex justify-center">
              Login to Data Center Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin"
                          type="text"
                          disabled={isLoading}
                          {...field}
                          required
                        />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="password"
                          type="password"
                          disabled={isLoading}
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <CardFooter className="flex flex-col justify-center gap-4 px-0">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                  <Link
                    to="/register"
                    className="ml-4 text-sm font-bold text-gray-500 hover:underline"
                  >
                    Don't have an account?
                  </Link>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
