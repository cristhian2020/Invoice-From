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

function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const start = dayjs(`2000-01-01T${startTime}`);
  let end = dayjs(`2000-01-01T${endTime}`);
  if (end.isBefore(start)) end = end.add(1, "day");
  const diff = end.diff(start, "hour", true);
  return Math.round(diff * 100) / 100;
}

export function useTimesheetForm() {
  const saved = useRef(loadFromStorage());

  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>(
    saved.current?.employeeInfo ?? { name: "", operator: "", consultantId: "", rate: "" },
  );

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(
    saved.current?.projectInfo ?? { invoice: "", projectNumber: "", location: "" },
  );

  const [weekData, setWeekData] = useState<Record<string, DayData>>(INITIAL_WEEK_DATA);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(EMPTY_ERRORS);
  const [submitted, setSubmitted] = useState(false);

  const saveToStorage = useCallback(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ employeeInfo, projectInfo }),
    );
  }, [employeeInfo, projectInfo]);

  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  const validate = useCallback((): boolean => {
    const errors: ValidationErrors = { employee: {}, project: {}, days: {} };
    let isValid = true;

    const requiredEmployee: (keyof EmployeeInfo)[] = ["name", "operator", "consultantId", "rate"];
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
    if (name === "rate") {
      const rate = Number(value) || 0;
      setWeekData((prev) => {
        const updated = { ...prev };
        for (const day of DAYS) {
          if (day === "Saturday") {
            const totalHrs = Object.values(prev).reduce(
              (sum, d) => sum + (Number(d.hours) || 0), 0
            );
            updated[day] = {
              ...prev[day],
              billHours: rate ? String(Math.round(totalHrs * rate * 100) / 100) : "",
            };
          } else {
            updated[day] = { ...prev[day], billHours: "" };
          }
        }
        return updated;
      });
    }
  };

  const handleProjectChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleWeekDataChange = (day: string, field: keyof DayData, value: string | number) => {
    setWeekData((prev) => {
      const updated = { ...prev[day], [field]: value };
      if (field === "startTime" || field === "endTime") {
        updated.hours = calculateHours(updated.startTime, updated.endTime);
      }

      const newWeek = { ...prev, [day]: updated };

      const rate = Number(employeeInfo.rate) || 0;
      const totalHrs = Object.values(newWeek).reduce(
        (sum, d) => sum + (Number(d.hours) || 0), 0
      );
      newWeek["Saturday"] = {
        ...newWeek["Saturday"],
        billHours: rate ? String(Math.round(totalHrs * rate * 100) / 100) : "",
      };

      for (const d of DAYS) {
        if (d !== "Saturday") {
          newWeek[d] = { ...newWeek[d], billHours: "" };
        }
      }

      return newWeek;
    });
  };

  const totalHours = useMemo(
    () => Object.values(weekData).reduce((sum, d) => sum + (Number(d.hours) || 0), 0),
    [weekData],
  );

  const totalBillHours = useMemo(
    () => Number(weekData["Saturday"]?.billHours) || 0,
    [weekData],
  );

  const totalAmount = useMemo(() => {
    const rate = Number(employeeInfo.rate) || 0;
    return Math.round(totalHours * rate * 100) / 100;
  }, [totalHours, employeeInfo.rate]);

  const saturdayHasData = useMemo(() => {
    const sat = weekData["Saturday"];
    return !!(sat.startTime && sat.endTime);
  }, [weekData]);

  const setEmployeeFields = useCallback((fields: Partial<EmployeeInfo>) => {
    setEmployeeInfo((prev) => {
      const updated = { ...prev, ...fields };
      if ("rate" in fields) {
        const rate = Number(fields.rate) || 0;
        setWeekData((prevWeek) => {
          const updatedWeek = { ...prevWeek };
          const totalHrs = Object.values(prevWeek).reduce(
            (sum, d) => sum + (Number(d.hours) || 0), 0
          );
          updatedWeek["Saturday"] = {
            ...prevWeek["Saturday"],
            billHours: rate ? String(Math.round(totalHrs * rate * 100) / 100) : "",
          };
          return updatedWeek;
        });
      }
      return updated;
    });
  }, []);

  const setProjectFields = useCallback((fields: Partial<ProjectInfo>) => {
    setProjectInfo((prev) => ({ ...prev, ...fields }));
  }, []);

  return {
    employeeInfo,
    projectInfo,
    weekData,
    totalHours,
    totalBillHours,
    totalAmount,
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
  };
}
