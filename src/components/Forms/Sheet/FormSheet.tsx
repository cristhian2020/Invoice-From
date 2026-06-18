import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTimesheetForm } from "../../../hooks/useTimesheetForm";
import { useAuth } from "../../../context/AuthContext";
import EmployeeInfoSection from "./EmployeeInfoSection";
import ProjectInfoSection from "./ProjectInfoSection";
import DailyHoursTable from "./DailyHoursTable";
import PDFTemplate from "./PDFTemplate";

const FormSheet = () => {
  const form = useTimesheetForm();
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { user, logout } = useAuth();

  const downloadPDF = async () => {
    form.setSubmitted(true);
    const isValid = form.validate();
    if (!isValid) return;

    if (!pdfTemplateRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const canvas = await html2canvas(pdfTemplateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll("style").forEach((style) => {
            if (style.textContent) {
              style.textContent = style.textContent.replace(
                /oklch\([^)]*\)/g,
                "transparent",
              );
            }
          });
          const el = clonedDoc.getElementById("pdf-template-wrapper");
          if (el) {
            el.style.position = "relative";
            el.style.left = "0";
            el.style.top = "0";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`timesheet_${form.employeeInfo.name || "document"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF. Revisa la consola para más detalles.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-3 sm:p-6">
        {/* User Profile & Logout Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-300" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 bg-red-100 text-red-600 font-bold flex items-center justify-center rounded-full border border-red-200 uppercase text-lg">
                {user?.email?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.displayName || user?.email?.split("@")[0]}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-lg text-sm transition-all border border-red-200 hover:text-white hover:border-red-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Log Out
          </button>
        </div>

        <h1 className="text-xl sm:text-3xl font-bold text-gray-800 text-center mb-4 sm:mb-8">
          Element Safety, LLC. - Time Sheet Generator
        </h1>

        <div className="space-y-4 sm:space-y-6">
          <EmployeeInfoSection
            employeeInfo={form.employeeInfo}
            onChange={form.handleEmployeeChange}
            errors={form.submitted ? form.validationErrors.employee : undefined}
          />

          <ProjectInfoSection
            projectInfo={form.projectInfo}
            onChange={form.handleProjectChange}
            errors={form.submitted ? form.validationErrors.project : undefined}
          />

          <DailyHoursTable
            weekData={form.weekData}
            totalHours={form.totalHours}
            totalBillHours={form.totalBillHours}
            totalAmount={form.totalAmount}
            rate={form.employeeInfo.rate}
            saturdayHasData={form.saturdayHasData}
            onDayChange={form.handleWeekDataChange}
            dayErrors={form.submitted ? form.validationErrors.days : undefined}
          />

          <div className="flex flex-col items-center gap-3 pt-2 sm:pt-4">
            {form.submitted && (Object.keys(form.validationErrors.employee).length > 0 || Object.keys(form.validationErrors.project).length > 0 || Object.keys(form.validationErrors.days).length > 0) && (
              <p className="text-red-500 text-sm font-medium">
               Aun hay campos sin llenar
              </p>
            )}
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className={`w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                isGeneratingPDF
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isGeneratingPDF ? "Generando PDF..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      <PDFTemplate
        ref={pdfTemplateRef}
        employeeInfo={form.employeeInfo}
        projectInfo={form.projectInfo}
        weekData={form.weekData}
        totalHours={form.totalHours}
        totalBillHours={form.totalBillHours}
      />
    </div>
  );
};

export default FormSheet;
