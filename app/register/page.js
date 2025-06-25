"use client";
import { useState } from "react";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { AlertTriangle, Info } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async ({ email, password, name, role }) => {
    if (!email || !password || !name) {
      setError("All fields are required");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await registerUser(email, password, name, role);

      if (role === "admin") {
        alert("Admin account created successfully! You can now log in.");
        router.push("/login");
      } else {
        alert("Registration successful! Your account is pending approval.");
        router.push("/pending");
      }
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please use a different email or login."
        );
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">Account Registration</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
        <h3 className="font-medium text-indigo-800 flex items-center">
          <Info className="h-4 w-4 mr-2" /> Registration Information
        </h3>
        <p className="text-sm text-indigo-700 mt-1">
          Students: Your account will require admin approval before you can access the system.
          <br />
          Teachers: You cannot self-register. Please contact an administrator to create your account.
          <br />
          Admins: You can create an admin account directly by selecting the admin option.
        </p>
      </div>

      <AuthForm
        onSubmit={handleRegister}
        isRegister={true}
        allowAdminRegistration={true}
        buttonText={loading ? "Registering..." : "Register Account"}
      />

      <p className="mt-4 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
