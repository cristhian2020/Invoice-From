import type { DayData } from "./types";
import { DAYS } from "./types";

interface DayErrors {
  startTime?: boolean;
  endTime?: boolean;
}

interface Props {
  weekData: Record<string, DayData>;
  totalHours: number;
  onDayChange: (day: string, field: keyof DayData, value: string | number) => void;
  dayErrors?: Partial<Record<string, DayErrors>>;
}

const inputBase =
  "w-full p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const readonlyClass =
  "w-full p-1 border border-gray-300 rounded text-sm bg-gray-50 cursor-not-allowed";

function getInputClass(hasError?: boolean) {
  return `${inputBase} ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"}`;
}

export default function DailyHoursTable({
  weekData,
  totalHours,
  onDayChange,
  dayErrors = {},
}: Props) {
  return (
    <section>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">
        Daily Hours
      </h2>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              {["DAY", "Date", "Start Time (AM)", "End Time (PM)", "Hours", "Remarks"].map((h) => (
                <th key={h} className="border border-gray-300 p-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const errs = dayErrors[day];
              return (
                <tr key={day} className={`hover:bg-gray-50 ${errs ? "bg-red-50/40" : ""}`}>
                  <td className="border border-gray-300 p-2 font-medium whitespace-nowrap">
                    {day}
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="date"
                      value={weekData[day].date}
                      onChange={(e) => onDayChange(day, "date", e.target.value)}
                      className={inputBase + " border-gray-300"}
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="time"
                      step="900"
                      value={weekData[day].startTime}
                      onChange={(e) => onDayChange(day, "startTime", e.target.value)}
                      className={getInputClass(errs?.startTime)}
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="time"
                      step="900"
                      value={weekData[day].endTime}
                      onChange={(e) => onDayChange(day, "endTime", e.target.value)}
                      className={getInputClass(errs?.endTime)}
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="number" value={weekData[day].hours || ""} readOnly className={readonlyClass} />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="text"
                      value={weekData[day].remarks}
                      onChange={(e) => onDayChange(day, "remarks", e.target.value)}
                      className={inputBase + " border-gray-300"}
                    />
                  </td>
                </tr>
              );
            })}
            <TotalsRow
              totalHours={totalHours}
              colSpan={4}
            />
          </tbody>
        </table>
        {Object.keys(dayErrors).length > 0 && (
          <p className="text-red-500 text-xs mt-1">Fill in Start Time and End Time for at least one day</p>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {DAYS.map((day) => {
          const errs = dayErrors[day];
          return (
            <div
              key={day}
              className={`border rounded-lg p-3 bg-white shadow-sm ${errs ? "border-red-400" : "border-gray-300"}`}
            >
              <h3 className="font-semibold text-gray-800 mb-2">{day}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500">Date</label>
                  <input
                    type="date"
                    value={weekData[day].date}
                    onChange={(e) => onDayChange(day, "date", e.target.value)}
                    className={inputBase + " border-gray-300"}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Hours</label>
                  <input type="number" value={weekData[day].hours || ""} readOnly className={readonlyClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Start Time</label>
                  <input
                    type="time"
                    step="900"
                    value={weekData[day].startTime}
                    onChange={(e) => onDayChange(day, "startTime", e.target.value)}
                    className={getInputClass(errs?.startTime)}
                  />
                  {errs?.startTime && <p className="text-red-500 text-xs mt-0.5">Required</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500">End Time</label>
                  <input
                    type="time"
                    step="900"
                    value={weekData[day].endTime}
                    onChange={(e) => onDayChange(day, "endTime", e.target.value)}
                    className={getInputClass(errs?.endTime)}
                  />
                  {errs?.endTime && <p className="text-red-500 text-xs mt-0.5">Required</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Remarks</label>
                  <input
                    type="text"
                    value={weekData[day].remarks}
                    onChange={(e) => onDayChange(day, "remarks", e.target.value)}
                    className={inputBase + " border-gray-300"}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Mobile totals */}
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-100 font-bold text-sm">
          <div className="flex justify-between">
            <span>Total Hours</span>
            <span>{totalHours}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Shared totals row for the desktop table */
function TotalsRow({
  totalHours,
  colSpan,
}: {
  totalHours: number;
  colSpan: number;
}) {
  return (
    <>
      <tr className="bg-gray-100 font-bold text-sm">
        <td colSpan={colSpan} className="border border-gray-300 p-2 text-right">
          TOTALS
        </td>
        <td className="border border-gray-300 p-2">{totalHours}</td>
        <td className="border border-gray-300 p-2" />
      </tr>
    </>
  );
}
