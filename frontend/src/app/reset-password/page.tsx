"use client";

import { FormEvent, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { apiRequest } from "@/services/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");
  const [confirmPasswordError, setConfirmPasswordError] =
    useState("");

  const [loading, setLoading] = useState(false);

  function validateForm(): boolean {
    let valid = true;

    setPasswordError("");
    setConfirmPasswordError("");

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError(
        "Password must be at least 8 characters"
      );
      valid = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError(
        "Password must contain an uppercase letter"
      );
      valid = false;
    } else if (!/[a-z]/.test(password)) {
      setPasswordError(
        "Password must contain a lowercase letter"
      );
      valid = false;
    } else if (!/[0-9]/.test(password)) {
      setPasswordError(
        "Password must contain a number"
      );
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        "Please confirm your password"
      );
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Passwords do not match"
      );
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token) {
      toast.error(
        "Invalid or missing password reset link."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({
            token,
            new_password: password,
          }),
        }
      );

      toast.success(
        data.message ||
          "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="mb-2 text-2xl font-bold">
          Reset Password
        </h1>

        <p className="mb-6 text-gray-600">
          Enter your new password below.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="New password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                className="w-full rounded-md border p-3 pr-10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
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

            {passwordError && (
              <p className="mt-1 text-sm text-red-600">
                {passwordError}
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
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
                className="w-full rounded-md border p-3 pr-10"
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

            {confirmPasswordError && (
              <p className="mt-1 text-sm text-red-600">
                {confirmPasswordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black p-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
