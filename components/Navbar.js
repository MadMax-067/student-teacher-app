"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { logoutUser, getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, User, BookOpen } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("Auth state changed:", user ? user.uid : "no user");
      setUser(user);

      if (user) {
        try {
          const userData = await getUserRole(user.uid);
          console.log("User data in navbar:", userData);
          setUserInfo(userData);
        } catch (error) {
          console.error("Error getting user role:", error);
        }
      } else {
        setUserInfo(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-gradient-to-r from-indigo-700 to-purple-800 py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          <span className="flex items-center">
            <BookOpen className="h-6 w-6 mr-2" /> Student-Teacher
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {!loading && (
            user ? (
              <div className="flex items-center gap-4">
                <span className="text-white/90">
                  {userInfo?.name || user.email}
                  {userInfo?.role && (
                    <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {userInfo.role}
                    </span>
                  )}
                </span>
                
                {userInfo?.role && (
                  <Link
                    href={`/dashboard/${userInfo.role}`}
                    className="text-white hover:text-indigo-100 transition"
                  >
                    Dashboard
                  </Link>
                )}
                
                {userInfo?.role && (
                  <Link
                    href="/profile"
                    className="text-white hover:text-blue-100 transition"
                  >
                    Profile
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition shadow-sm"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-white hover:text-indigo-100 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-indigo-700 px-4 py-1.5 rounded-md hover:bg-indigo-50 transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )
          )}
        </div>

        <button 
          className="md:hidden text-white"
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden pt-4 pb-2 px-4 mt-2 bg-white/10 rounded-lg">
          {!loading && (
            user ? (
              <div className="flex flex-col gap-3">
                <span className="text-white/90 font-medium">
                  {userInfo?.name || user.email}
                </span>
                
                {userInfo?.role && (
                  <Link
                    href={`/dashboard/${userInfo.role}`}
                    className="text-white hover:text-indigo-100 py-2 transition"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                )}
                
                {userInfo?.role && (
                  <Link
                    href="/profile"
                    className="text-white hover:text-blue-100 py-2 transition"
                    onClick={toggleMenu}
                  >
                    Profile
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 py-2">
                <Link 
                  href="/login" 
                  className="text-white hover:text-indigo-100 py-2 transition"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-50 transition shadow-sm"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
