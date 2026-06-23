import { forwardRef } from "react";
import dayjs from "dayjs";
import type { DayData, EmployeeInfo, ProjectInfo } from "./types";
import { DAYS } from "./types";

interface Props {
  employeeInfo: EmployeeInfo;
  projectInfo: ProjectInfo;
  weekData: Record<string, DayData>;
  totalHours: number;
  totalBillHours: number;
}

const S = {
  wrapper: {
    width: 1000,
    padding: 32,
    fontFamily: "sans-serif",
    backgroundColor: "#ffffff",
    color: "#000000",
    border: "1px solid #9ca3af",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 } as const,
  logoBox: { border: "4px solid #1e3a8a", padding: 8, display: "flex", flexDirection: "column", alignItems: "center" } as const,
  logoText: { color: "#1e3a8a", fontSize: 32, fontWeight: 700 },
  brandElement: { color: "#1e3a8a", fontSize: 40, fontWeight: 700 },
  brandSafety: { color: "#4ade80", fontSize: 32, fontWeight: 700 },
  titleMain: { color: "#1e3a8a", fontSize: 40, fontWeight: 700, marginBottom: 8 },
  titleSub: { color: "#1e3a8a", fontSize: 32, fontWeight: 600 },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    border: "2px solid #000",
    marginBottom: 4,
  } as const,
  infoCol: (borderRight: boolean) => ({
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    ...(borderRight ? { borderRight: "2px solid #000" } : {}),
  }),
  label: (borderBottom: boolean) => ({
    padding: 8,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    backgroundColor: "#eff6ff",
    color: "#1e3a8a",
    ...(borderBottom ? { borderBottom: "2px solid #000" } : {}),
  }),
  value: (borderBottom: boolean) => ({
    padding: 8,
    fontWeight: 700,
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...(borderBottom ? { borderBottom: "2px solid #000" } : {}),
  }),

  table: { width: "100%", border: "2px solid #000", textAlign: "center" as const, borderCollapse: "collapse" as const },
  th: { borderRight: "2px solid #000", padding: 8, fontSize: 18 },
  thLast: { padding: 8, fontSize: 18 },
  dayCell: (bgColor: string, textColor: string) => ({
    backgroundColor: bgColor,
    color: textColor,
    borderBottom: "2px solid #000",
    height: 48,
  }),
  td: { borderRight: "2px solid #000", fontSize: 18 },
  tdLast: { fontSize: 18 },
  totalsRow: { backgroundColor: "#22c55e", borderBottom: "2px solid #000", height: 48 },
  totalsLabel: { borderRight: "2px solid #000", textAlign: "right" as const, paddingRight: 16, fontWeight: 700, fontSize: 18, textTransform: "uppercase" as const, color: "#000" },
  totalsVal: { borderRight: "2px solid #000", fontWeight: 700, fontSize: 18, color: "#000" },

  notes: { marginTop: 16, fontSize: 16, fontWeight: 500 },
  billBox: {
    marginTop: 32,
    display: "flex",
    justifyContent: "flex-end",
  } as const,
  billBoxInner: { border: "2px solid #000", display: "flex", alignItems: "center" } as const,
  billLabel: { padding: 8, borderRight: "2px solid #000", fontWeight: 700, textTransform: "uppercase" as const },
  billValue: { padding: 8, width: 128, textAlign: "center" as const, fontWeight: 700, fontSize: 18 },

  signature: { marginTop: 48, display: "flex", alignItems: "flex-end", gap: 8, fontSize: 18, fontWeight: 700 } as const,
  signatureLine: { flex: 1, borderBottom: "2px solid #000", marginBottom: 4 },
  signatureName: { fontStyle: "italic", fontFamily: "serif" },
} as const;

function getDayColors(day: string): [string, string] {
  if (day === "Sunday") return ["#dc2626", "#ffffff"];
  if (day === "Saturday") return ["#facc15", "#000000"];
  return ["#ffffff", "#000000"];
}

const PDFTemplate = forwardRef<HTMLDivElement, Props>(
  ({ employeeInfo, projectInfo, weekData, totalHours, totalBillHours }, ref) => (
    <div
      id="pdf-template-wrapper"
      style={{ position: "absolute", left: -9999, top: -9999 }}
    >
      <div ref={ref} style={S.wrapper}>
        <div style={S.header}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={S.logoBox}>
              <span style={S.logoText}>2B</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={S.brandElement}>Element</span>
              <span style={S.brandSafety}>SAFETY LLC</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={S.titleMain}>Element Safety, LLC.</h1>
            <h2 style={S.titleSub}>Time Sheet</h2>
          </div>
        </div>

        <div style={S.infoGrid}>
          <div style={S.infoCol(true)}>
            <div style={S.label(true)}>Name</div>
            <div style={S.value(true)}>{employeeInfo.name}</div>
            <div style={S.label(true)}>Operator</div>
            <div style={S.value(true)}>{employeeInfo.operator}</div>
            <div style={S.label(false)}>Consultant ID</div>
            <div style={S.value(false)}>{employeeInfo.consultantId}</div>
            <div style={{ ...S.label(false), borderTop: "2px solid #000" }}>Rate</div>
            <div style={{ ...S.value(false), borderTop: "2px solid #000" }}>
              {employeeInfo.rate ? `$${employeeInfo.rate}/hr` : ""}
            </div>
          </div>
          <div style={S.infoCol(false)}>
            <div style={S.label(true)}>Invoice</div>
            <div style={S.value(true)}>{projectInfo.invoice}</div>
            <div style={S.label(true)}>Project #</div>
            <div style={S.value(true)}>{projectInfo.projectNumber}</div>
            <div style={S.label(false)}>Location</div>
            <div style={{ ...S.value(false), fontSize: 14, textAlign: "center" }}>
              {projectInfo.location}
            </div>
          </div>
        </div>

        <table style={S.table}>
          <thead>
            <tr style={{ backgroundColor: "#fff", borderBottom: "2px solid #000" }}>
              {["Day", "Date", "Start Time", "End Time", "Hours", "Bill Hours"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
              <th style={S.thLast}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const [bg, fg] = getDayColors(day);
              return (
                <tr key={day} style={S.dayCell(bg, fg)}>
                  <td style={{ ...S.td, fontWeight: 700 }}>{day}</td>
                  <td style={S.td}>
                    {weekData[day].date ? dayjs(weekData[day].date).format("MM/DD/YYYY") : ""}
                  </td>
                  <td style={S.td}>
                    {weekData[day].startTime
                      ? dayjs(`2000-01-01T${weekData[day].startTime}`).format("h:mm A")
                      : ""}
                  </td>
                  <td style={S.td}>
                    {weekData[day].endTime
                      ? dayjs(`2000-01-01T${weekData[day].endTime}`).format("h:mm A")
                      : ""}
                  </td>
                  <td style={S.td}>{weekData[day].hours || ""}</td>
                  <td style={S.td}>{day === "Saturday" ? weekData[day].billHours : ""}</td>
                  <td style={S.tdLast}>{weekData[day].remarks}</td>
                </tr>
              );
            })}
            <tr style={S.totalsRow}>
              <td colSpan={4} style={S.totalsLabel}>Totals</td>
              <td style={S.totalsVal}>{totalHours}</td>
              <td style={S.totalsVal}>{totalBillHours}</td>
              <td />
            </tr>
          </tbody>
        </table>

        <div style={S.notes}>
          <p>All time sheets must be signed by your supervisor.</p>
          <p>Time sheets must be turned in every week at the end of the last day worked.</p>
          <p>The work period begins Sunday morning and ends Saturday night.</p>
          <p>Send timesheets to: time@elementsafetyllc.com</p>
        </div>

        <div style={S.billBox}>
          <div style={S.billBoxInner}>
            <div style={S.billLabel}>Total Bill Hours =</div>
            <div style={S.billValue}>{totalBillHours}</div>
          </div>
        </div>

        <div style={S.signature}>
          <span>Client Superintendent Approval:</span>
          <div style={S.signatureLine} />
          <span style={S.signatureName}>Sean Lewis</span>
        </div>
      </div>
    </div>
  ),
);

PDFTemplate.displayName = "PDFTemplate";
export default PDFTemplate;
