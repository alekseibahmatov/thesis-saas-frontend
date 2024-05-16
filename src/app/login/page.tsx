"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, TextInputField } from "evergreen-ui";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type loginSchemaType = z.infer<typeof loginSchema>;

export default function Page() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<loginSchemaType>({ resolver: zodResolver(loginSchema) });

  const login: SubmitHandler<loginSchemaType> = ({ email, password }) => {
    signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-24">
      <h1>Login to SaaS</h1>
      <form onSubmit={handleSubmit(login)}>
        <div className="flex flex-col border border-gray-200 p-4">
          <TextInputField
            label="Email"
            type="text"
            placeholder="johndoe@saas.com"
            {...register("email")}
            required
          />
          <TextInputField
            label="Password"
            type="password"
            placeholder="******"
            {...register("password")}
            required
          />

          <Button type="submit" intent="primary">
            Login
          </Button>
        </div>
      </form>
    </div>
  );
}
