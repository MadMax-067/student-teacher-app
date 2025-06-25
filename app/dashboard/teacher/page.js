"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { logAction } from "@/lib/logging";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "react-hot-toast";
import {
  Check,
  X,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Info,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  BookOpen,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState({});
  const [activeTab, setActiveTab] = useState("appointments");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    cancelled: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("teacherId", "==", auth.currentUser.uid)
        );

        const appointmentsSnap = await getDocs(appointmentsQuery);
        const appointmentsList = appointmentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const statsData = {
          pending: appointmentsList.filter((a) => a.status === "pending")
            .length,
          approved: appointmentsList.filter((a) => a.status === "approved")
            .length,
          cancelled: appointmentsList.filter((a) => a.status === "cancelled")
            .length,
          total: appointmentsList.length,
        };

        setStats(statsData);
        setAppointments(appointmentsList);

        const messagesQuery = query(
          collection(db, "messages"),
          where("receiverId", "==", auth.currentUser.uid)
        );

        const messagesSnap = await getDocs(messagesQuery);
        const messagesList = messagesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(messagesList);

        const studentIds = new Set([
          ...appointmentsList.map((app) => app.studentId),
          ...messagesList.map((msg) => msg.senderId),
        ]);

        const studentDetails = {};

        for (const studentId of Array.from(studentIds)) {
          const studentDoc = await getDoc(doc(db, "users", studentId));
          if (studentDoc.exists()) {
            studentDetails[studentId] = studentDoc.data();
          }
        }

        setStudents(studentDetails);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: newStatus,
      });

      await logAction(
        auth.currentUser.uid,
        `Updated appointment ${appointmentId} status to ${newStatus}`
      );

      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === appointmentId) {
          return { ...appointment, status: newStatus };
        }
        return appointment;
      });

      setAppointments(updatedAppointments);

      setStats({
        pending: updatedAppointments.filter((a) => a.status === "pending")
          .length,
        approved: updatedAppointments.filter((a) => a.status === "approved")
          .length,
        cancelled: updatedAppointments.filter((a) => a.status === "cancelled")
          .length,
        total: updatedAppointments.length,
      });

      toast.success(`Appointment ${newStatus} successfully.`);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin">
          <ClockIcon className="h-12 w-12 text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 flex items-center">
            <div className="bg-indigo-50 rounded-full p-3 mr-4">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex items-center">
            <div className="bg-amber-50 rounded-full p-3 mr-4">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100 flex items-center">
            <div className="bg-emerald-50 rounded-full p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-100 flex items-center">
            <div className="bg-rose-50 rounded-full p-3 mr-4">
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>

        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              activeTab === "appointments"
                ? "border-indigo-600 text-indigo-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Calendar className="mr-2 h-5 w-5" /> Appointments
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              activeTab === "messages"
                ? "border-indigo-600 text-indigo-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            } ${messages.length > 0 ? "relative" : ""}`}
          >
            <MessageSquare className="mr-2 h-5 w-5" /> Messages
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "appointments" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" /> Appointment
                Requests
              </h2>

              {appointments.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                  <p className="text-gray-500">No appointment requests yet.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    When students book appointments, they'll appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const student = students[appointment.studentId] || {};

                    return (
                      <div
                        key={appointment.id}
                        className={`border rounded-lg p-5 ${
                          appointment.status === "pending"
                            ? "bg-amber-50 border-amber-200"
                            : appointment.status === "approved"
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-rose-50 border-rose-200"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <User className="h-5 w-5 text-gray-600 mr-2" />
                              <h3 className="font-medium text-gray-800">
                                {student.name || "Unknown Student"}
                              </h3>
                              <span className="ml-2 text-sm text-gray-500">
                                ({student.email})
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Info className="h-4 w-4 mr-1" />
                                <span className="font-medium">Purpose:</span>
                                <span className="ml-1">{appointment.purpose}</span>
                              </div>

                              <div className="flex items-center text-gray-600">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                <span className="font-medium">Date & Time:</span>
                                <span className="ml-1">
                                  {formatDate(appointment.datetime)}
                                </span>
                              </div>

                              <div className="flex items-center">
                                <span className="font-medium text-gray-600">Status:</span>
                                <span
                                  className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                                    appointment.status === "approved"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : appointment.status === "cancelled"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {appointment.status === "pending" && (
                            <div className="flex gap-2 md:self-start">
                              <button
                                onClick={() =>
                                  updateAppointmentStatus(appointment.id, "approved")
                                }
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  updateAppointmentStatus(appointment.id, "cancelled")
                                }
                                className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-blue-600" /> Messages
              </h2>

              {messages.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                  <p className="text-gray-500">No messages yet.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    When students send you messages, they'll appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const student = students[message.senderId] || {};

                    return (
                      <div
                        key={message.id}
                        className="border border-indigo-200 rounded-lg p-5 bg-indigo-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-indigo-200 rounded-full p-2">
                              <User className="h-4 w-4 text-indigo-700" />
                            </div>
                            <div className="ml-2">
                              <h3 className="font-medium text-gray-800">
                                {student.name || "Unknown Student"}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {formatDate(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-indigo-200">
                          <p className="text-gray-700">{message.content}</p>
                        </div>

                        {message.appointmentId && (
                          <div className="mt-2 text-xs text-blue-600">
                            Related to appointment: {message.appointmentId}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
