

interface Props {
  recipients: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isSaving: boolean;
  error?: string;
  onDownloadPDF?: () => void;
  isGeneratingPDF?: boolean;
}

export default function EmailSection({
  // recipients,
  // onChange,
  // onSend,
  // isSaving,
  // error,
  onDownloadPDF,
  isGeneratingPDF
}: Props) {
  return (
    <section className="mt-6 border-t pt-6">
      {/* 
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">
        Send Timesheet
      </h2>
      <div className="max-w-xl">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
          Recipients (separated by commas or semicolons) *
        </label>
        <div className="relative">
          <textarea
            value={recipients}
            onChange={(e) => onChange(e.target.value)}
            placeholder="manager@elementsafety.com, accounting@elementsafety.com"
            rows={2}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black bg-white placeholder-gray-400 resize-y"
            disabled={isSaving}
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      */}
        
      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        {/*
        <button
          type="button"
          onClick={onSend}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-green-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Sending.....
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              SENT
            </>
          )}
        </button>
        */}

          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              disabled={isGeneratingPDF}
              className={`w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-md active:scale-[0.98] focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer flex items-center justify-center ${
                isGeneratingPDF
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isGeneratingPDF ? "Generando PDF..." : "Download PDF"}
            </button>
          )}
        </div>
    </section>
  );
}
