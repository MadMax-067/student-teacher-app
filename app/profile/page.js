"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { useRouter } from "next/navigation";
import { User, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          router.push("/login");
          return;
        }
        
        setUser(currentUser);
        
        const userData = await getUserRole(currentUser.uid);
        setUserRole(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 sticky top-4">
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-indigo-600" />
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900">
                    {userRole?.name || "User"}
                  </h2>
                  
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-1" />
                    {user?.email}
                  </div>
                  
                  <div className="mt-3 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {userRole?.role || "User"}
                  </div>
                  
                  <div className="mt-6 w-full">
                    <a
                      href={`/dashboard/${userRole?.role}`}
                      className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                    >
                      Back to Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}