"use client";
import {SubmitHandler, useForm} from "react-hook-form";
import {signIn} from "next-auth/react";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "~/components/ui/form";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type loginSchemaType = z.infer<typeof loginSchema>;

export default function Page() {
  const form = useForm<loginSchemaType>({ resolver: zodResolver(loginSchema) });

  const login: SubmitHandler<loginSchemaType> = ({ email, password }) => {
    void signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-24">
      <Card className="w-[400px]">
          <CardHeader>
              <CardTitle>Login to SaaS</CardTitle>
          </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(login)} className="space-y-8">
                    <FormField control={form.control} name="email" render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="admin@saas.com" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="password" render={({field}) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )} />
                    <Button type="submit">Login</Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
