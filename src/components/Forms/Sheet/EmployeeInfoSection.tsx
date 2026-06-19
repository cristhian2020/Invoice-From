import { useEffect, useState } from "react";
import type { EmployeeInfo } from "./types";
import { getUserByEmployeeNumber } from "../../../firebase/firestoreService";

interface Props {
  employeeInfo: EmployeeInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Partial<Record<keyof EmployeeInfo, boolean>>;
  setEmployeeFields: (fields: Partial<EmployeeInfo>) => void;
}

const inputClass =
  "w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white";

export default function EmployeeInfoSection({ 
  employeeInfo, 
  onChange, 
  errors = {},
  setEmployeeFields
}: Props) {
  const [searching, setSearching] = useState(false);
  const [foundProfile, setFoundProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const cid = employeeInfo.consultantId.trim();
    if (!cid) {
      setFoundProfile(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const { profile } = await getUserByEmployeeNumber(cid);
        if (profile && profile.name) {
          setEmployeeFields({ name: profile.name });
          setFoundProfile(true);
        } else {
          setFoundProfile(false);
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
        setFoundProfile(false);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [employeeInfo.consultantId, setEmployeeFields]);

  const getInputClass = (field: keyof EmployeeInfo) =>
    `${inputClass} ${errors[field] ? "border-red-500 bg-red-50 text-black" : "border-gray-300"}`;

  return (
    <section className="border-b pb-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">
        Employee Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">CONSULTANT ID / EMPLOYEE NUMBER *</label>
          <input
            type="text"
            name="consultantId"
            value={employeeInfo.consultantId}
            onChange={onChange}
            placeholder="e.g. 11234"
            className={getInputClass("consultantId")}
            required
          />
          {searching && (
            <p className="text-gray-500 text-[11px] mt-0.5 animate-pulse">Searching Firestore...</p>
          )}
          {!searching && foundProfile === true && (
            <p className="text-green-600 text-[11px] mt-0.5">✓ Employee profile loaded</p>
          )}
          {!searching && foundProfile === false && (
            <p className="text-amber-600 text-[11px] mt-0.5">No employee found with this ID</p>
          )}
          {errors.consultantId && <p className="text-red-500 text-xs mt-1">Required field consultant ID</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">NAME *</label>
          <input
            type="text"
            name="name"
            value={employeeInfo.name}
            onChange={onChange}
            placeholder="Your Name"
            className={getInputClass("name")}
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">Required field name</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">OPERATOR *</label>
          <input
            type="text"
            name="operator"
            value={employeeInfo.operator}
            onChange={onChange}
            placeholder="e.g. Power Solutions"
            className={getInputClass("operator")}
            required
          />
          {errors.operator && <p className="text-red-500 text-xs mt-1">Required field operator</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">RATE ($/hr) *</label>
          <input
            type="number"
            name="rate"
            value={employeeInfo.rate}
            onChange={onChange}
            placeholder="e.g. 25"
            className={getInputClass("rate")}
            required
          />
          {errors.rate && <p className="text-red-500 text-xs mt-1">Required field rate</p>}
        </div>
      </div>
    </section>
  );
}