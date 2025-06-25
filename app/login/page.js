"use client";
import { useState } from "react";
import { loginUser, getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { Info } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async ({ email, password }) => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      const userCredential = await loginUser(email, password);
      
      const userData = await getUserRole(userCredential.user.uid);
      
      if (userData.role === "admin") {
        router.push("/dashboard/admin");
      } else if (userData.role === "teacher") {
        router.push("/dashboard/teacher");
      } else if (userData.role === "student") {
        if (userData.approved) {
          router.push("/dashboard/student");
        } else {
          router.push("/pending");
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("Invalid email or password");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many unsuccessful login attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <AuthForm
        onSubmit={handleLogin}
        isRegister={false}
        buttonText={loading ? "Logging in..." : "Login"}
      />

      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
        <h3 className="font-medium text-indigo-800 flex items-center">
          <Info className="h-4 w-4 mr-2" /> Teacher Accounts
        </h3>
        <p className="text-sm text-indigo-700 mt-1">
          Teachers: Use the credentials provided by your administrator to log in.
        </p>
      </div>

      <p className="mt-4 text-center">
        Don't have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register as a student
        </Link>
      </p>
    </div>
  );
}
