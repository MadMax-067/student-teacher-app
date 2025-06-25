"use client";
import { useState } from "react";
import { User, Mail, Lock, ShieldAlert } from "lucide-react";

const AuthForm = ({ onSubmit, isRegister = false, buttonText = "Submit", allowAdminRegistration = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [showAdminOption, setShowAdminOption] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Email and password are required");
      return;
    }

    if (isRegister && !name.trim()) {
      alert("Name is required");
      return;
    }

    const data = { email, password };

    if (isRegister) {
      data.name = name;
      data.role = role;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="space-y-5">
        {isRegister && (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {allowAdminRegistration && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  {!showAdminOption && (
                    <button
                      type="button"
                      onClick={() => setShowAdminOption(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Need admin account?
                    </button>
                  )}
                </div>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === "student"}
                      onChange={() => setRole("student")}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Student</span>
                  </label>
                  
                  {showAdminOption && (
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={role === "admin"}
                        onChange={() => setRole("admin")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        <ShieldAlert size={14} className="mr-1 text-indigo-600" /> Admin
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="example@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder={
                isRegister ? "Create a password" : "Enter your password"
              }
              required
            />
          </div>
          {isRegister && (
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
