"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { logAction } from "@/lib/logging";
import { initializeApp, getApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "react-hot-toast";
import {
  User,
  Plus,
  Trash2,
  Check,
  Users,
  UserPlus,
  BookOpen,
  Building,
  Calendar,
  Mail,
  Key,
  Copy,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("teachers");
  const [showCredentials, setShowCredentials] = useState(false);
  const [newTeacherCredentials, setNewTeacherCredentials] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = collection(db, "users");
        const pendingQuery = query(
          usersRef,
          where("role", "==", "student"),
          where("approved", "==", false)
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingList = pendingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPendingStudents(pendingList);

        const teachersSnap = await getDocs(collection(db, "teachers"));
        setTeachers(
          teachersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateRandomPassword = () => {
    const length = 10;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setPassword(password);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("Copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy to clipboard");
      }
    );
  };

  const addTeacher = async () => {
    if (!name || !email || !subject || !department || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const adminUser = auth.currentUser;
      const adminUid = adminUser.uid;

      const adminToken = await adminUser.getIdToken();

      const secondaryAuth = initializeApp(
        {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId:
            process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        },
        "secondary"
      );

      const secondaryAuthInstance = getAuth(secondaryAuth);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuthInstance,
        email,
        password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        name,
        role: "teacher",
        approved: true,
        createdAt: new Date(),
        createdBy: adminUid,
      });

      await setDoc(doc(db, "teachers", uid), {
        name,
        email,
        subject,
        department,
        createdBy: adminUid,
        createdAt: new Date(),
      });

      await logAction(adminUid, `Added teacher ${name} with account`);

      setNewTeacherCredentials({
        name,
        email,
        password,
        uid,
      });

      setShowCredentials(true);

      setTeachers([
        ...teachers,
        {
          id: uid,
          name,
          email,
          subject,
          department,
          createdBy: adminUid,
          createdAt: new Date(),
        },
      ]);

      await deleteApp(secondaryAuth);

      setName("");
      setEmail("");
      setSubject("");
      setDepartment("");
      setPassword("");

      toast.success("Teacher added successfully!");
    } catch (error) {
      console.error("Error adding teacher:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email is already in use. Please use a different email.");
      } else {
        toast.error(`Failed to add teacher: ${error.message}`);
      }
    }
  };

  const approveStudent = async (id, studentName) => {
    try {
      await updateDoc(doc(db, "users", id), { approved: true });
      await logAction(
        auth.currentUser.uid,
        `Approved student ${studentName || id}`
      );

      setPendingStudents(
        pendingStudents.filter((student) => student.id !== id)
      );

      toast.success("Student approved successfully!");
    } catch (error) {
      console.error("Error approving student:", error);
      toast.error("Failed to approve student");
    }
  };

  const deleteTeacher = async (id, teacherName) => {
    if (confirm(`Are you sure you want to delete teacher ${teacherName}?`)) {
      try {
        await deleteDoc(doc(db, "teachers", id));

        try {
          await deleteDoc(doc(db, "users", id));
        } catch (error) {
          console.error("Error deleting user document:", error);
        }

        await logAction(auth.currentUser.uid, `Deleted teacher ${teacherName}`);

        setTeachers(teachers.filter((teacher) => teacher.id !== id));

        toast.success("Teacher deleted successfully!");
      } catch (error) {
        console.error("Error deleting teacher:", error);
        toast.error("Failed to delete teacher");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg flex items-center">
              <Calendar className="mr-2" size={18} />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <Link
              href="/profile"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <User className="mr-2" size={18} />
              Profile
            </Link>
          </div>
        </div>

        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("teachers")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              activeTab === "teachers"
                ? "border-indigo-600 text-indigo-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="mr-2" size={18} /> Manage Teachers
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              activeTab === "approvals"
                ? "border-indigo-600 text-indigo-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            } ${pendingStudents.length > 0 ? "relative" : ""}`}
          >
            <UserPlus className="mr-2" size={18} /> Pending Approvals
            {pendingStudents.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingStudents.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              activeTab === "admins"
                ? "border-indigo-600 text-indigo-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <ShieldAlert className="mr-2" size={18} /> Manage Admins
          </button>
        </div>

        {activeTab === "teachers" && (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Add New Teacher</h2>
                <p className="text-sm text-gray-600 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start">
                  <AlertCircle
                    size={18}
                    className="text-amber-600 mr-2 flex-shrink-0 mt-0.5"
                  />
                  Teachers can only be added by admins. The account you create
                  here will allow the teacher to log in to the system.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Users size={18} />
                      </div>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Teacher name"
                        className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        placeholder="teacher@example.com"
                        className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <BookOpen size={18} />
                      </div>
                      <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject taught"
                        className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Building size={18} />
                      </div>
                      <input
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Department"
                        className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Key size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set a temporary password"
                      className="w-full pl-10 pr-32 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      minLength={6}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-indigo-600 hover:text-indigo-800 focus:outline-none text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long. The teacher
                    will use this to log in.
                  </p>
                </div>

                <button
                  onClick={addTeacher}
                  className="mt-4 flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                  <Plus className="mr-2" size={18} /> Add Teacher with Account
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Manage Teachers</h2>
                {teachers.length === 0 ? (
                  <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                    <p className="text-gray-500">No teachers added yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add a new teacher using the form above
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {teachers.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {teacher.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {teacher.email || "No email"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {teacher.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {teacher.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() =>
                                  deleteTeacher(teacher.id, teacher.name)
                                }
                                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "approvals" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Pending Student Approvals
              </h2>
              {pendingStudents.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                  <p className="text-gray-500">No pending approvals</p>
                  <p className="text-sm text-gray-400 mt-1">
                    All student registrations have been processed
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Registered
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {student.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                            {student.createdAt
                              ? new Date(
                                  student.createdAt.toDate()
                                ).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() =>
                                approveStudent(student.id, student.name)
                              }
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                            >
                              <Check size={16} />
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "admins" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Add New Administrator
              </h2>
              <p className="text-sm text-gray-600 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start">
                <AlertCircle
                  size={18}
                  className="text-amber-600 mr-2 flex-shrink-0 mt-0.5"
                />
                Admins have full access to the system. Use caution when granting
                admin privileges.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Users size={18} />
                    </div>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Admin name"
                      className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      placeholder="admin@example.com"
                      className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Key size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a temporary password"
                    className="w-full pl-10 pr-32 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    minLength={6}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-indigo-600 hover:text-indigo-800 focus:outline-none text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long. The admin will
                  use this to log in.
                </p>
              </div>

              <button
                onClick={addTeacher}
                className="mt-4 flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                <Plus className="mr-2" size={18} /> Add Admin with Account
              </button>
            </div>
          </div>
        )}

        {showCredentials && newTeacherCredentials && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Teacher Account Created
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please save or share these credentials with the teacher. This
                information will not be shown again.
              </p>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Teacher Name</p>
                  <p className="font-medium flex justify-between">
                    {newTeacherCredentials.name}
                    <button
                      onClick={() =>
                        copyToClipboard(newTeacherCredentials.name)
                      }
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Copy size={14} />
                    </button>
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="font-medium flex justify-between">
                    {newTeacherCredentials.email}
                    <button
                      onClick={() =>
                        copyToClipboard(newTeacherCredentials.email)
                      }
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Copy size={14} />
                    </button>
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">
                    Temporary Password
                  </p>
                  <p className="font-medium flex justify-between">
                    {newTeacherCredentials.password}
                    <button
                      onClick={() =>
                        copyToClipboard(newTeacherCredentials.password)
                      }
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Copy size={14} />
                    </button>
                  </p>
                </div>

                <button
                  onClick={() =>
                    copyToClipboard(
                      `Teacher Account\nName: ${newTeacherCredentials.name}\nEmail: ${newTeacherCredentials.email}\nPassword: ${newTeacherCredentials.password}\nLogin at: ${window.location.origin}/login`
                    )
                  }
                  className="w-full mt-2 bg-indigo-100 text-indigo-700 py-2 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Copy size={14} /> Copy All Credentials
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowCredentials(false);
                    setNewTeacherCredentials(null);
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
