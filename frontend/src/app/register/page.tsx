"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/services/api";
import Link from "next/link";
import { FieldErrors } from "@/types/auth";

import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validateForm(): boolean { 
    const errors: FieldErrors = { 
      userName: "",
      email: "",
      password: "", 
      confirmPassword: "", }; 
    const trimmedName = userName.trim(); 
    
    if (!trimmedName) { 
      errors.userName = "Name is required"; 
    } else if (trimmedName.length < 3) { 
      errors.userName = "Name must be at least 3 characters"; 
    } else if (!/[A-Za-z]/.test(trimmedName)) {
      errors.userName = "Name must contain at least one letter"; 
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) { 
      errors.userName = "Name can contain only letters and spaces"; } 
    
    if (!email.trim()) { 
      errors.email = "Email is required"; 
    } else if ( !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email.trim() ) ) {
      errors.email = "Enter a valid email address"; } 

    if (!password) {
      errors.password = "Password is required"; 
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters"; 
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain an uppercase letter"; 
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain a lowercase letter"; 
    } else if (!/[0-9]/.test(password)) { errors.password = "Password must contain a number"; } 

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"; 
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"; 
    }
    
    setFieldErrors(errors); 
    
    return !Object.values(errors).some( (value) => value !== "" ); 
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid){
      return;
    }

    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          user_name: userName.trim(),
          confirm_password: confirmPassword,
        }),
      });

      setEmail("");
      setUserName("");
      setPassword("");
      setConfirmPassword("");

      toast.success(
        "Registration successful. Please check your email to verify your account."
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Registration failed"
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="mb-6 text-2xl font-bold">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded border p-3"
              required
            />
            {fieldErrors.userName && ( 
              <p className="mt-1 text-sm text-red-600"> 
              {fieldErrors.userName} 
              </p> 
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border p-3"
              required
            />
            {fieldErrors.email && ( 
              <p className="mt-1 text-sm text-red-600"> 
              {fieldErrors.email} 
              </p>
            )}
          </div>  
          
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded border p-3 pr-10"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full rounded border p-3 pr-10"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded bg-black p-3 text-white"
          >
            Register
          </button>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "http://localhost:8000/auth/google/login";
            }}
            className="w-full rounded-lg border px-4 py-3 font-medium hover:bg-gray-50"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-black hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}