import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole } from "../../firebase/firestoreService";
import type { UserProfile } from "../../firebase/firestoreService";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingUid, setTogglingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { users: data } = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "employee" : "admin";
    setTogglingUid(uid);
    await updateUserRole(uid, newRole);
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
    );
    setTogglingUid(null);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.employeeNumber?.toLowerCase().includes(q)
    );
  });

  const roleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        Employee
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-xs font-medium">
            {users.filter((u) => u.role === "admin").length} Admin{users.filter((u) => u.role === "admin").length !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-xs font-medium">
            {users.filter((u) => u.role !== "admin").length} Employee{users.filter((u) => u.role !== "admin").length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto text-slate-300 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-slate-500 text-sm">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Employee</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Employee #</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Projects</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const isSelf = u.uid === currentUser?.uid;
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                            {u.name?.charAt(0) || u.email?.charAt(0) || "?"}
                          </div>
                          <span className="font-medium text-slate-700">
                            {u.name || "Unnamed"}
                            {isSelf && <span className="ml-1.5 text-xs text-slate-400">(you)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{u.email}</td>
                      <td className="px-5 py-3 text-slate-600 font-mono text-xs">{u.employeeNumber || "—"}</td>
                      <td className="px-5 py-3">
                        {u.projects?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {u.projects.slice(0, 3).map((p, i) => (
                              <span key={i} className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                {p}
                              </span>
                            ))}
                            {u.projects.length > 3 && (
                              <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                                +{u.projects.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">None</span>
                        )}
                      </td>
                      <td className="px-5 py-3">{roleBadge(u.role)}</td>
                      <td className="px-5 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <button
                            onClick={() => handleToggleRole(u.uid, u.role)}
                            disabled={togglingUid === u.uid}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 ${
                              u.role === "admin"
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                            }`}
                          >
                            {togglingUid === u.uid
                              ? "..."
                              : u.role === "admin"
                              ? "Remove Admin"
                              : "Make Admin"}
                          </button>
                        )}
                      </td>
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
