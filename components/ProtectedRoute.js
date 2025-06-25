"use client";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react"; 

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async (user) => {
      try {
        if (!user) {
          console.log("No user found, redirecting to login");
          router.push("/login");
          return;
        }

        console.log("Checking role for user:", user.uid);
        
        const userData = await getUserRole(user.uid);
        console.log("User data:", userData);
        
        const { role, approved } = userData;

        if (!isMounted) return;

        if (!allowedRoles.includes(role)) {
          console.log(`Role ${role} not allowed, redirecting to unauthorized`);
          router.push("/unauthorized");
          return;
        }

        if (role === "student" && !approved) {
          console.log("Student not approved, redirecting to pending");
          router.push("/pending");
          return;
        }

        console.log("Authorization successful");
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted) {
          router.push("/login");
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthChecked(true);
      if (user) {
        checkAuth(user);
      } else {
        router.push("/login");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [allowedRoles, router]);

  if (loading && !authChecked) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (loading && authChecked) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Redirecting to the appropriate page...</p>
      </div>
    );
  }

  return children;
}
