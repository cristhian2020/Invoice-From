import { useEffect, useState } from "react";
import { getAllTimesheets } from "../../firebase/firestoreService";
import type { TimesheetData } from "../../firebase/firestoreService";

export default function TimesheetsViewer() {
  const [timesheets, setTimesheets] = useState<TimesheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { timesheets: data } = await getAllTimesheets();
      setTimesheets(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = timesheets.filter((ts) => {
    const q = search.toLowerCase();
    return (
      ts.employeeInfo?.name?.toLowerCase().includes(q) ||
      ts.projectInfo?.projectNumber?.toLowerCase().includes(q) ||
      ts.projectInfo?.location?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading timesheets...</p>
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
            placeholder="Search by employee, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-colors"
          />
        </div>
        <p className="text-sm text-slate-500">
          {filtered.length} timesheet{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto text-slate-300 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-slate-500 text-sm">No timesheets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider w-8"></th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Employee</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Project #</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Hours</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Rate</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ts) => {
                  const id = ts.id || "";
                  const isExpanded = expandedId === id;
                  const date = ts.submittedAt?.toDate
                    ? ts.submittedAt.toDate().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <>
                      <tr
                        key={id}
                        onClick={() => setExpandedId(isExpanded ? null : id)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                              {ts.employeeInfo?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-slate-700">{ts.employeeInfo?.name || "Unknown"}</p>
                              <p className="text-xs text-slate-400">ID: {ts.employeeInfo?.consultantId || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{ts.projectInfo?.projectNumber || "—"}</td>
                        <td className="px-5 py-3 text-slate-600">{ts.projectInfo?.location || "—"}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {ts.totalHours} hrs
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">${ts.employeeInfo?.rate || "0"}/hr</td>
                        <td className="px-5 py-3 font-semibold text-slate-800">${ts.totalAmount?.toFixed(2) || "0.00"}</td>
                        <td className="px-5 py-3 text-slate-500 text-xs">{date}</td>
                      </tr>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <tr key={`${id}-detail`}>
                          <td colSpan={8} className="px-5 py-4 bg-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {/* Employee Info */}
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <h4 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider">Employee Info</h4>
                                <div className="space-y-1.5">
                                  <p className="text-slate-600"><span className="font-medium text-slate-500">Name:</span> {ts.employeeInfo?.name}</p>
                                  <p className="text-slate-600"><span className="font-medium text-slate-500">Operator:</span> {ts.employeeInfo?.operator || "—"}</p>
                                  <p className="text-slate-600"><span className="font-medium text-slate-500">ID:</span> {ts.employeeInfo?.consultantId}</p>
                                  <p className="text-slate-600"><span className="font-medium text-slate-500">Rate:</span> ${ts.employeeInfo?.rate}/hr</p>
                                </div>
                              </div>

                              {/* Project Info */}
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <h4 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider">Project Info</h4>
                                <div className="space-y-1.5">
                                  <p className="text-slate-600"><span className="font-medium text-slate-500">Invoice:</span> {ts.projectInfo?.invoice}</p>
                                  <p className="text-slate-600"><span className="font-medium text-slate-500">Project #:</span> {ts.projectInfo?.projectNumber}</p>
                                  <p className="text-slate-600"><span className="font-medium text-slate-500">Location:</span> {ts.projectInfo?.location}</p>
                                </div>
                              </div>

                              {/* Weekly Hours */}
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <h4 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider">Weekly Hours</h4>
                                <div className="space-y-1">
                                  {ts.weekData && Object.entries(ts.weekData).map(([day, data]: [string, any]) => (
                                    <div key={day} className="flex justify-between text-slate-600">
                                      <span className="text-slate-500">{day}</span>
                                      <span className="font-medium">{data?.hours || 0} hrs</span>
                                    </div>
                                  ))}
                                  <div className="border-t border-slate-200 pt-1 mt-1 flex justify-between font-semibold text-slate-800">
                                    <span>Total</span>
                                    <span>{ts.totalHours} hrs — ${ts.totalAmount?.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
