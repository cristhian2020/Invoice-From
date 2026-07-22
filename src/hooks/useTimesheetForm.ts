import { useState, useMemo, useRef, useEffect, useCallback, type ChangeEvent } from "react";
import dayjs from "dayjs";
import type { DayData, EmployeeInfo, ProjectInfo } from "../components/Forms/Sheet/types";
import { DAYS, INITIAL_WEEK_DATA, LS_KEY } from "../components/Forms/Sheet/types"

export interface ValidationErrors {
  employee: Partial<Record<keyof EmployeeInfo, boolean>>;
  project: Partial<Record<keyof ProjectInfo, boolean>>;
  days: Partial<Record<string, { startTime?: boolean; endTime?: boolean }>>
}

const EMPTY_ERRORS: ValidationErrors = { employee: {}, project: {}, days: {} };

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return null;
}

function snapTo15(time: string): string {
  if (!time) return time;
  const [h, m] = time.split(":").map(Number);
  const snapped = Math.ceil(m / 15) * 15;
  const finalH = snapped === 60 ? h + 1 : h;
  const finalM = snapped === 60 ? 0 : snapped;
  return `${String(finalH % 24).padStart(2, "0")}:${String(finalM).padStart(2, "0")}`;
}

function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const start = dayjs(`2000-01-01T${startTime}`);
  let end = dayjs(`2000-01-01T${endTime}`);
  if (end.isBefore(start)) end = end.add(1, "day");
  const diff = end.diff(start, "hour", true);
  return Math.ceil(diff * 100) / 100;
}

export function useTimesheetForm() {
  const saved = useRef(loadFromStorage());

  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>(
    saved.current?.employeeInfo ?? { name: "", operator: "", consultantId: "" },
  );

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(
    saved.current?.projectInfo ?? { invoice: "", projectNumber: "", location: "" },
  );

  const [weekData, setWeekData] = useState<Record<string, DayData>>(INITIAL_WEEK_DATA);

  const [recipients, setRecipients] = useState<string>(
    saved.current?.recipients ?? ""
  );

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(EMPTY_ERRORS);
  const [submitted, setSubmitted] = useState(false);

  const saveToStorage = useCallback(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ employeeInfo, projectInfo, recipients }),
    );
  }, [employeeInfo, projectInfo, recipients]);

  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  const validate = useCallback((): boolean => {
    const errors: ValidationErrors = { employee: {}, project: {}, days: {} };
    let isValid = true;

    const requiredEmployee: (keyof EmployeeInfo)[] = ["name", "operator", "consultantId"];
    for (const field of requiredEmployee) {
      if (!employeeInfo[field].trim()) {
        errors.employee[field] = true;
        isValid = false;
      }
    }

    const requiredProject: (keyof ProjectInfo)[] = ["invoice", "projectNumber", "location"];
    for (const field of requiredProject) {
      if (!projectInfo[field].trim()) {
        errors.project[field] = true;
        isValid = false;
      }
    }

    let hasAnyDay = false;
    for (const day of DAYS) {
      const d = weekData[day];
      if (d.startTime || d.endTime) {
        if (!d.startTime) {
          errors.days[day] = { ...errors.days[day], startTime: true };
          isValid = false;
        }
        if (!d.endTime) {
          errors.days[day] = { ...errors.days[day], endTime: true };
          isValid = false;
        }
        if (d.startTime && d.endTime) hasAnyDay = true;
      }
    }

    if (!hasAnyDay) {
      for (const day of DAYS) {
        if (day !== "Sunday" && day !== "Saturday") {
          errors.days[day] = { startTime: true, endTime: true };
        }
      }
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [employeeInfo, projectInfo, weekData]);

  useEffect(() => {
    if (submitted) validate();
  }, [submitted, validate]);

  const handleEmployeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployeeInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleWeekDataChange = (day: string, field: keyof DayData, value: string | number) => {
    setWeekData((prev) => {
      let finalValue = value;
      if ((field === "startTime" || field === "endTime") && typeof value === "string") {
        finalValue = snapTo15(value);
      }
      const updated = { ...prev[day], [field]: finalValue };
      if (field === "startTime" || field === "endTime") {
        updated.hours = calculateHours(updated.startTime, updated.endTime);
      }

      return { ...prev, [day]: updated };
    });
  };

  const totalHours = useMemo(
    () => {
      const raw = Object.values(weekData).reduce((sum, d) => sum + (Number(d.hours) || 0), 0);
      return Math.ceil(raw * 100) / 100;
    },
    [weekData],
  );

  const saturdayHasData = useMemo(() => {
    const sat = weekData["Saturday"];
    return !!(sat.startTime && sat.endTime);
  }, [weekData]);

  const setEmployeeFields = useCallback((fields: Partial<EmployeeInfo>) => {
    setEmployeeInfo((prev) => ({ ...prev, ...fields }));
  }, []);

  const setProjectFields = useCallback((fields: Partial<ProjectInfo>) => {
    setProjectInfo((prev) => ({ ...prev, ...fields }));
  }, []);

  return {
    employeeInfo,
    projectInfo,
    weekData,
    totalHours,
    validationErrors,
    submitted,
    saturdayHasData,
    setSubmitted,
    validate,
    handleEmployeeChange,
    handleProjectChange,
    handleWeekDataChange,
    setEmployeeFields,
    setProjectFields,
    recipients,
    setRecipients,
  };
}
