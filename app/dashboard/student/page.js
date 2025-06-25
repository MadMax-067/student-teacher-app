"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { logAction } from "@/lib/logging";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  MessageSquare,
  User,
  BookOpen,
  Building,
  PenSquare,
  Plus,
  CheckCircle2,
  XCircle,
  ClockIcon,
  CalendarDays,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("book");

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [purpose, setPurpose] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [message, setMessage] = useState("");

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    cancelled: 0,
    total: 0,
  });

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersSnap = await getDocs(collection(db, "teachers"));
        const teachersList = teachersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeachers(teachersList);

        if (auth.currentUser) {
          const appointmentsQuery = query(
            collection(db, "appointments"),
            where("studentId", "==", auth.currentUser.uid),
            orderBy("createdAt", "desc")
          );

          const appointmentsSnap = await getDocs(appointmentsQuery);
          const appointmentsList = appointmentsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setMyAppointments(appointmentsList);

          setStats({
            pending: appointmentsList.filter((a) => a.status === "pending")
              .length,
            approved: appointmentsList.filter((a) => a.status === "approved")
              .length,
            cancelled: appointmentsList.filter((a) => a.status === "cancelled")
              .length,
            total: appointmentsList.length,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const bookAppointment = async (e) => {
    e.preventDefault();

    if (!selectedTeacher || !purpose || !appointmentDate || !appointmentTime) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const studentId = auth.currentUser.uid;
      const appointmentDatetime = new Date(
        `${appointmentDate}T${appointmentTime}`
      );

      const appointmentRef = await addDoc(collection(db, "appointments"), {
        teacherId: selectedTeacher,
        studentId,
        purpose,
        datetime: appointmentDatetime,
        status: "pending", 
        createdAt: new Date(),
      });

      await logAction(
        studentId,
        `Booked appointment with teacher ${selectedTeacher}`
      );

      if (message.trim()) {
        await addDoc(collection(db, "messages"), {
          appointmentId: appointmentRef.id,
          senderId: studentId,
          receiverId: selectedTeacher,
          content: message,
          timestamp: new Date(),
        });

        await logAction(
          studentId,
          `Sent message to teacher ${selectedTeacher}`
        );
      }

      const selectedTeacherData = teachers.find(
        (t) => t.id === selectedTeacher
      );

      
      const newAppointment = {
        id: appointmentRef.id,
        teacherId: selectedTeacher,
        teacherName: selectedTeacherData?.name,
        studentId,
        purpose,
        datetime: appointmentDatetime,
        status: "pending",
        createdAt: new Date(),
      };

      setMyAppointments([newAppointment, ...myAppointments]);

      setStats({
        ...stats,
        pending: stats.pending + 1,
        total: stats.total + 1,
      });

      setSelectedTeacher("");
      setPurpose("");
      setAppointmentDate("");
      setAppointmentTime("");
      setMessage("");

      setActiveTab("appointments");

      toast.success("Appointment request submitted! Awaiting teacher approval.");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  const handleSendMessage = (appointmentId, teacherId) => {
    setSelectedAppointment({
      id: appointmentId,
      teacherId: teacherId,
    });
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedAppointment) {
      toast.error("Please enter a message");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error("You must be logged in to send messages");
        return;
      }

      const messageRef = collection(db, "messages");
      await addDoc(messageRef, {
        senderId: currentUser.uid,
        receiverId: selectedAppointment.teacherId,
        appointmentId: selectedAppointment.id,
        content: messageText,
        createdAt: new Date(),
        read: false,
      });

      toast.success("Message sent successfully");
      setMessageText("");
      setShowMessageModal(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
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
          <Clock className="h-12 w-12 text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Dashboard
          </h1>
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

          <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-50 flex items-center">
            <div className="bg-yellow-100 rounded-full p-3 mr-4">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.pending}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-50 flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.approved}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-red-50 flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.cancelled}
              </p>
            </div>
          </div>
        </div>

        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("book")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              activeTab === "book"
                ? "border-indigo-600 text-indigo-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Plus className="mr-2 h-5 w-5" /> Book Appointment
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex items-center px-4 py-3 border-b-2 ${
              activeTab === "appointments"
                ? "border-indigo-600 text-indigo-600 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <CalendarDays className="mr-2 h-5 w-5" /> My Appointments
          </button>
        </div>

        {activeTab === "book" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <PenSquare className="mr-2 h-5 w-5 text-blue-600" /> Book New
                Appointment
              </h2>

              <form onSubmit={bookAppointment} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Select Teacher
                  </label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Select a teacher --</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject} ({teacher.department}
                        )
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Purpose
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief purpose of the appointment"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <input
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Message (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-gray-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional details or questions for the teacher"
                      rows={3}
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <Calendar className="mr-2 h-5 w-5" /> Book Appointment
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-blue-600" /> My
                Appointments
              </h2>

              {myAppointments.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                  <p className="text-gray-500">
                    You haven't booked any appointments yet.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Use the "Book Appointment" tab to schedule your first
                    meeting with a teacher
                  </p>
                  <button
                    onClick={() => setActiveTab("book")}
                    className="mt-4 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-4 py-2 rounded-lg transition-colors inline-flex items-center"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Book Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAppointments.map((appointment) => {
                    const teacher =
                      teachers.find((t) => t.id === appointment.teacherId) ||
                      {};

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
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <User className="h-5 w-5 text-gray-600 mr-2" />
                              <h3 className="font-medium text-gray-800">
                                {teacher.name || "Unknown Teacher"}
                              </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                              <div className="flex items-center text-gray-600">
                                <BookOpen className="h-4 w-4 mr-1" />
                                <span className="font-medium">Subject:</span>
                                <span className="ml-1">
                                  {teacher.subject || "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center text-gray-600">
                                <Building className="h-4 w-4 mr-1" />
                                <span className="font-medium">Department:</span>
                                <span className="ml-1">
                                  {teacher.department || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center text-gray-600">
                                <PenSquare className="h-4 w-4 mr-1" />
                                <span className="font-medium">Purpose:</span>
                                <span className="ml-1">
                                  {appointment.purpose}
                                </span>
                              </div>

                              <div className="flex items-center text-gray-600">
                                <CalendarDays className="h-4 w-4 mr-1" />
                                <span className="font-medium">
                                  Date & Time:
                                </span>
                                <span className="ml-1">
                                  {formatDate(appointment.datetime)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="md:text-right mt-3 md:mt-0">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                appointment.status === "approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : appointment.status === "cancelled"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {appointment.status === "approved" ? (
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                              ) : appointment.status === "cancelled" ? (
                                <XCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <ClockIcon className="mr-1 h-3 w-3" />
                              )}
                              {appointment.status}
                            </span>

                            <p className="text-xs text-gray-500 mt-1">
                              Booked on {formatDate(appointment.createdAt)}
                            </p>

                            {appointment.status === "approved" && (
                              <div className="mt-2">
                                <button
                                  onClick={() =>
                                    handleSendMessage(
                                      appointment.id,
                                      appointment.teacherId
                                    )
                                  }
                                  className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1"
                                >
                                  <Send className="h-3 w-3" /> Send Message
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {showMessageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Send Message to Teacher
              </h3>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 resize-none"
                required
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
