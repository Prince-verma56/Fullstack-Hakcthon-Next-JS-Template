import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Hackathon App</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your dashboard
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
