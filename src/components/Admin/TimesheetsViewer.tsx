import { useEffect, useState } from "react";
import { getPaginatedTimesheets } from "../../firebase/firestoreService";
import type { TimesheetData } from "../../firebase/firestoreService";

const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(t: string | undefined) {
  if (!t) return "—";
  // t is "HH:mm", convert to 12h format
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function TimesheetsViewer() {
  const [timesheets, setTimesheets] = useState<TimesheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      const { timesheets: data, lastDoc: doc } = await getPaginatedTimesheets(PAGE_SIZE, null);
      setTimesheets(data);
      setLastDoc(doc);
      setHasMore(data.length === PAGE_SIZE);
      setLoading(false);
    };
    fetchInitial();
  }, []);

  const loadMore = async () => {
    if (!lastDoc || !hasMore || loadingMore) return;
    setLoadingMore(true);
    const { timesheets: data, lastDoc: newDoc } = await getPaginatedTimesheets(PAGE_SIZE, lastDoc);
    setTimesheets((prev) => [...prev, ...data]);
    setLastDoc(newDoc);
    setHasMore(data.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const filtered = timesheets.filter((ts) => {
    const q = search.toLowerCase();
    return (
      ts.employeeInfo?.name?.toLowerCase().includes(q) ||
      ts.projectInfo?.projectNumber?.toLowerCase().includes(q) ||
      ts.projectInfo?.location?.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
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

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-12 h-12 mx-auto text-slate-300 mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="text-slate-500 text-sm">No timesheets found.</p>
          </div>
        ) : (
          <>
            {/* ─── DESKTOP TABLE ─── */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider w-8"></th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Project #
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((ts) => (
                    <DesktopRow
                      key={ts.id || ""}
                      ts={ts}
                      isExpanded={expandedId === (ts.id || "")}
                      onToggle={() => toggleExpand(ts.id || "")}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── MOBILE CARDS ─── */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filtered.map((ts) => (
                <MobileCard
                  key={ts.id || ""}
                  ts={ts}
                  isExpanded={expandedId === (ts.id || "")}
                  onToggle={() => toggleExpand(ts.id || "")}
                />
              ))}
            </div>

            {hasMore && (
              <div className="py-6 flex justify-center border-t border-slate-200">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors border ${
                    loadingMore 
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                      Cargando...
                    </span>
                  ) : (
                    "Cargar más"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   DESKTOP ROW + EXPANDED DETAIL
   ════════════════════════════════════════════════ */
function DesktopRow({
  ts,
  isExpanded,
  onToggle,
}: {
  ts: TimesheetData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
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
        onClick={onToggle}
        className="hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <td className="px-4 py-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 uppercase shrink-0">
              {ts.employeeInfo?.name?.charAt(0) || "?"}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-700 truncate">
                {ts.employeeInfo?.name || "Unknown"}
              </p>
              <p className="text-xs text-slate-400">
                ID: {ts.employeeInfo?.consultantId || "—"}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-slate-600">
          {ts.projectInfo?.projectNumber || "—"}
        </td>
        <td className="px-4 py-3 text-slate-600">
          {ts.projectInfo?.location || "—"}
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {ts.totalHours} hrs
          </span>
        </td>
        <td className="px-4 py-3 text-slate-500 text-xs">{date}</td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0">
            <ExpandedDetail ts={ts} />
          </td>
        </tr>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════
   MOBILE CARD
   ════════════════════════════════════════════════ */
function MobileCard({
  ts,
  isExpanded,
  onToggle,
}: {
  ts: TimesheetData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const date = ts.submittedAt?.toDate
    ? ts.submittedAt.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="p-4">
      {/* Tap header */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 text-left cursor-pointer"
      >
        <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 uppercase shrink-0 mt-0.5">
          {ts.employeeInfo?.name?.charAt(0) || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-800 truncate text-sm">
              {ts.employeeInfo?.name || "Unknown"}
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            ID: {ts.employeeInfo?.consultantId || "—"} · Project{" "}
            {ts.projectInfo?.projectNumber || "—"}
          </p>

          {/* Quick stats row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              {ts.totalHours} hrs
            </span>
            <span className="text-slate-400">{date}</span>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3">
          <ExpandedDetail ts={ts} />
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   SHARED EXPANDED DETAIL (used by both layouts)
   ════════════════════════════════════════════════ */
function ExpandedDetail({ ts }: { ts: TimesheetData }) {
  // Check if any day has remarks
  const hasAnyRemarks =
    ts.weekData &&
    Object.values(ts.weekData).some(
      (d: any) => d?.remarks && d.remarks.trim(),
    );

  return (
    <div className="bg-slate-50 border-t border-slate-200 px-4 py-5 sm:px-6 space-y-5">
      {/* ── Info cards row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Employee Info */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h4 className="font-semibold text-slate-700 mb-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            Employee Info
          </h4>
          <div className="space-y-1.5 text-sm">
            <p className="text-slate-600">
              <span className="font-medium text-slate-500">Name:</span>{" "}
              {ts.employeeInfo?.name}
            </p>
            <p className="text-slate-600">
              <span className="font-medium text-slate-500">Cliente:</span>{" "}
              {ts.employeeInfo?.operator || "—"}
            </p>
            <p className="text-slate-600">
              <span className="font-medium text-slate-500">ID:</span>{" "}
              {ts.employeeInfo?.consultantId}
            </p>

          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h4 className="font-semibold text-slate-700 mb-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
            Project Info
          </h4>
          <div className="space-y-1.5 text-sm">
            <p className="text-slate-600">
              <span className="font-medium text-slate-500">PO Number:</span>{" "}
              {ts.projectInfo?.invoice}
            </p>
            <p className="text-slate-600">
              <span className="font-medium text-slate-500">Project #:</span>{" "}
              {ts.projectInfo?.projectNumber}
            </p>
            <p className="text-slate-600">
              <span className="font-medium text-slate-500">Location:</span>{" "}
              {ts.projectInfo?.location}
            </p>
          </div>
        </div>
      </div>

      {/* ── Daily Hours Detail ── */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Daily Hours Detail
          </h4>
        </div>

        {/* Desktop table for daily hours */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-2.5 font-semibold">Day</th>
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">Start</th>
                <th className="px-4 py-2.5 font-semibold">End</th>
                <th className="px-4 py-2.5 font-semibold">Hours</th>
                <th className="px-4 py-2.5 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ts.weekData &&
                DAYS_ORDER.map((day) => {
                  const d = ts.weekData[day];
                  if (!d) return null;
                  const hasHours = d.hours && d.hours > 0;
                  return (
                    <tr
                      key={day}
                      className={
                        hasHours ? "bg-white" : "bg-slate-50/40 text-slate-400"
                      }
                    >
                      <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">
                        {day}
                      </td>
                      <td className="px-4 py-2 text-slate-600 whitespace-nowrap">
                        {d.date || "—"}
                      </td>
                      <td className="px-4 py-2 text-slate-600 whitespace-nowrap">
                        <span
                          className={
                            hasHours
                              ? "inline-flex items-center gap-1"
                              : ""
                          }
                        >
                          {hasHours && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                          )}
                          {formatTime(d.startTime)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600 whitespace-nowrap">
                        <span
                          className={
                            hasHours
                              ? "inline-flex items-center gap-1"
                              : ""
                          }
                        >
                          {hasHours && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                          )}
                          {formatTime(d.endTime)}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium text-slate-700">
                        {d.hours || 0}
                      </td>
                      <td className="px-4 py-2 text-slate-500 max-w-xs truncate">
                        {d.remarks?.trim() || "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-semibold text-sm">
                <td colSpan={4} className="px-4 py-2.5 text-right text-slate-600 uppercase text-xs tracking-wider">
                  Totals
                </td>
                <td className="px-4 py-2.5 text-slate-800">
                  {ts.totalHours} hrs
                </td>
                <td className="px-4 py-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile card layout for daily hours */}
        <div className="sm:hidden divide-y divide-slate-100">
          {ts.weekData &&
            DAYS_ORDER.map((day) => {
              const d = ts.weekData[day];
              if (!d) return null;
              const hasHours = d.hours && d.hours > 0;
              return (
                <div
                  key={day}
                  className={`px-4 py-3 ${hasHours ? "" : "opacity-50"}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-slate-700">
                      {day}
                    </span>
                    <span className="text-xs text-slate-400">{d.date || ""}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Start</span>
                      <span className="text-slate-700 font-medium">
                        {formatTime(d.startTime)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">End</span>
                      <span className="text-slate-700 font-medium">
                        {formatTime(d.endTime)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Hours</span>
                      <span className="text-slate-700 font-medium">
                        {d.hours || 0}
                      </span>
                    </div>
                  </div>

                  {d.remarks?.trim() && (
                    <p className="text-xs text-slate-500 mt-1 bg-amber-50 rounded px-2 py-1 border border-amber-100">
                      <span className="font-medium text-amber-700">Remark:</span>{" "}
                      {d.remarks.trim()}
                    </p>
                  )}
                </div>
              );
            })}

          {/* Mobile totals */}
          <div className="px-4 py-3 bg-slate-100">
            <div className="flex justify-between text-sm font-semibold text-slate-700">
              <span>Total Hours</span>
              <span>{ts.totalHours} hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Remarks summary (only if any day has remarks) ── */}
      {hasAnyRemarks && (
        <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <h4 className="font-semibold text-amber-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-amber-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
              Remarks Summary
            </h4>
          </div>
          <div className="px-4 py-3 space-y-2">
            {DAYS_ORDER.map((day) => {
              const d = ts.weekData?.[day];
              if (!d?.remarks?.trim()) return null;
              return (
                <div key={day} className="flex gap-3 text-sm">
                  <span className="font-medium text-slate-500 shrink-0 w-24">
                    {day}:
                  </span>
                  <span className="text-slate-700">{d.remarks.trim()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
