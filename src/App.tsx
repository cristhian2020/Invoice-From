import { AuthProvider, useAuth } from "./context/AuthContext"
import FormSheet from "./components/Forms/Sheet/FormSheet"
import AuthPage from "./components/Auth/AuthPage"
import AdminDashboard from "./components/Admin/AdminDashboard"

function AppContent() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Background Decorative Blur Blobs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col items-center gap-4 relative z-10 text-center px-4">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-red-600 rounded-full animate-spin"></div>
          <div className="space-y-1">
            <h3 className="text-white font-bold text-lg">Element Safety, LLC.</h3>
            <p className="text-slate-400 text-sm animate-pulse">Cargando tu portal seguro...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <main className="bg-white">
      <FormSheet />
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App

