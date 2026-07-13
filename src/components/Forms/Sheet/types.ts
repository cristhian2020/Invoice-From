import dayjs from "dayjs";

export interface DayData {
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  remarks: string;
}

export interface EmployeeInfo {
  name: string;
  operator: string;
  consultantId: string;
}

export interface ProjectInfo {
  invoice: string;
  projectNumber: string;
  location: string;
}

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const INITIAL_WEEK_DATA: Record<string, DayData> = (() => {
  const weekStart = dayjs().startOf("week");

  return Object.fromEntries(
    DAYS.map((day, index) => [
      day,
      {
        date: weekStart.add(index, "day").format("YYYY-MM-DD"),
        startTime: "",
        endTime: "",
        hours: 0,
        remarks: "",
      },
    ]),
  ) as Record<string, DayData>;
})();

export const LS_KEY = "formsheet_data";
