import Link from "next/link";
import {
  Calendar,
  Clock,
  MessageSquare,
  Users,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-20 flex flex-col items-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Student-Teacher Appointment System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-10">
          Book appointments with teachers easily and manage your schedule efficiently.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-sm"
          >
            Sign In <ArrowRight size={16} className="ml-2" />
          </Link>
          <Link
            href="/register"
            className="bg-white hover:bg-gray-100 text-indigo-600 border border-indigo-600 px-6 py-3 rounded-lg font-medium transition shadow-sm"
          >
            Create Account
          </Link>
        </div>
      </section>

      <section className="w-full max-w-6xl py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Key Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center text-indigo-600 mb-4">
              <Calendar size={20} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
            <p className="text-gray-600">
              Book appointments with teachers based on their availability.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="bg-emerald-100 rounded-full w-12 h-12 flex items-center justify-center text-emerald-600 mb-4">
              <Clock size={20} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
            <p className="text-gray-600">
              Get notified when your appointment is approved or cancelled.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center text-purple-600 mb-4">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
            <p className="text-gray-600">
              Send messages to teachers about your appointment details.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center text-amber-600 mb-4">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-semibold mb-2">User Roles</h3>
            <p className="text-gray-600">
              Specific dashboards for students, teachers and administrators.
            </p>
          </div>
        </div>
      </section>

      <div className="text-center mt-8 text-sm text-gray-500">
        <p>First time setup? <Link href="/setup" className="text-indigo-600 hover:underline">Create admin account</Link></p>
      </div>
    </div>
  );
}
