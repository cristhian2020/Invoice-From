import { useEffect, useState, useRef } from "react";
import type { ProjectInfo } from "./types";
import { useAuth } from "../../../context/AuthContext";
import { getAllProjects, getUserProfile } from "../../../firebase/firestoreService";

interface Props {
  projectInfo: ProjectInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Partial<Record<keyof ProjectInfo, boolean>>;
  setProjectFields: (fields: Partial<ProjectInfo>) => void;
}

const inputClass =
  "w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white";

export default function ProjectInfoSection({ 
  projectInfo, 
  onChange, 
  errors = {},
  setProjectFields
}: Props) {
  const { user } = useAuth();
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const mergedProjects = new Set<string>();

      // Fetch global projects
      try {
        const { projects } = await getAllProjects();
        projects.forEach(p => mergedProjects.add(p));
      } catch (e) {
        console.error("Error fetching global projects:", e);
      }

      // Fetch user's registered projects
      if (user?.uid) {
        try {
          const { profile } = await getUserProfile(user.uid);
          if (profile && profile.projects) {
            profile.projects.forEach(p => mergedProjects.add(p));
          }
        } catch (e) {
          console.error("Error fetching user projects:", e);
        }
      }

      setAllProjects(Array.from(mergedProjects));
    };

    fetchProjects();
  }, [user]);

  useEffect(() => {
    const val = projectInfo.projectNumber.trim();
    if (!val) {
      setFilteredProjects([]);
      return;
    }

    const filtered = allProjects.filter(p => 
      p.toLowerCase().startsWith(val.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [projectInfo.projectNumber, allProjects]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInputClass = (field: keyof ProjectInfo) =>
    `${inputClass} ${errors[field] ? "border-red-500 bg-red-50 text-black" : "border-gray-300"}`;

  return (
    <section className="border-b pb-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">
        Project Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">INVOICE *</label>
          <input
            type="text"
            name="invoice"
            value={projectInfo.invoice}
            onChange={onChange}
            placeholder="Ej: 17"
            className={getInputClass("invoice")}
          />
          {errors.invoice && <p className="text-red-500 text-xs mt-1">Required field invoice</p>}
        </div>
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">PROJECT # *</label>
          <input
            type="text"
            name="projectNumber"
            value={projectInfo.projectNumber}
            onChange={onChange}
            onFocus={() => setShowDropdown(true)}
            placeholder="Ej: IAD 45"
            className={getInputClass("projectNumber")}
            autoComplete="off"
          />
          {showDropdown && filteredProjects.length > 0 && (
            <div 
              ref={dropdownRef}
              className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredProjects.map((proj, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setProjectFields({ projectNumber: proj });
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-black hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {proj}
                </button>
              ))}
            </div>
          )}
          {errors.projectNumber && <p className="text-red-500 text-xs mt-1">Required field project number</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">LOCATION *</label>
          <input
            type="text"
            name="location"
            value={projectInfo.location}
            onChange={onChange}
            placeholder="Ej: 43714 Efficiently Drive, Dulles VA 20166"
            className={getInputClass("location")}
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">Required field location</p>}
        </div>
      </div>
    </section>
  );
}
