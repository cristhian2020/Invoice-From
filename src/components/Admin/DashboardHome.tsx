import { useEffect, useState } from "react";
import {
  getAllTimesheets,
  getAllUsers,
  getAllProjectsFull,
} from "../../firebase/firestoreService";
import type { TimesheetData, UserProfile, Project } from "../../firebase/firestoreService";

export default function DashboardHome() {
  const [timesheets, setTimesheets] = useState<TimesheetData[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [tsResult, usersResult, projResult] = await Promise.all([
        getAllTimesheets(),
        getAllUsers(),
        getAllProjectsFull(),
      ]);
      setTimesheets(tsResult.timesheets);
      setUsers(usersResult.users);
      setProjects(projResult.projects);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const totalAmount = timesheets.reduce((sum, ts) => sum + (ts.totalAmount || 0), 0);

  const stats = [
    {
      label: "Employees",
      value: users.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Projects",
      value: projects.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      ),
      color: "bg-emerald-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Timesheets",
      value: timesheets.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: "bg-amber-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Total Billed",
      value: `$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-red-500",
      bgLight: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const recentTimesheets = timesheets.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bgLight} ${stat.textColor} p-2.5 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Timesheets */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Recent Timesheets</h3>
          <p className="text-xs text-slate-500 mt-0.5">Latest submitted timesheets from employees</p>
        </div>

        {recentTimesheets.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            No timesheets submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Employee</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Project</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Hours</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTimesheets.map((ts, i) => {
                  const date = ts.submittedAt?.toDate
                    ? ts.submittedAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—";
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                            {ts.employeeInfo?.name?.charAt(0) || "?"}
                          </div>
                          <span className="font-medium text-slate-700">{ts.employeeInfo?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{ts.projectInfo?.projectNumber || "—"}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {ts.totalHours} hrs
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-800">${ts.totalAmount?.toFixed(2) || "0.00"}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
