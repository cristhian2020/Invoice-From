import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
// import { FcGoogle } from "react-icons/fc";
import { GrUserWorker } from "react-icons/gr";


const AuthPage = () => {
  const { /* loginWithGoogle, */ loginWithEmail, registerWithEmail } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [projects, setProjects] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const translateError = (errMessage: string) => {
    if (errMessage.includes("auth/invalid-email") || errMessage.includes("invalid-email")) {
      return "The email format is invalid.";
    }
    if (
      errMessage.includes("auth/wrong-password") || 
      errMessage.includes("auth/user-not-found") ||
      errMessage.includes("auth/invalid-credential") ||
      errMessage.includes("invalid-credential")
    ) {
      return "The email or password are incorrect.";
    }
    if (errMessage.includes("auth/email-already-in-use") || errMessage.includes("email-already-in-use")) {
      return "This email is already in use.";
    }
    if (errMessage.includes("auth/weak-password") || errMessage.includes("weak-password")) {
      return "The password must be at least 6 characters long.";
    }
    if (errMessage.includes("auth/popup-closed-by-user") || errMessage.includes("popup-closed-by-user")) {
      return "The Google sign-in was cancelled.";
    }
    return errMessage || "An unexpected error occurred. Please try again.";
  };

  // const handleGoogleSignIn = async () => {
  //   setError(null);
  //   setLoading(true);
  //   try {
  //     const { error: signInError } = await loginWithGoogle();
  //     if (signInError) {
  //       setError(translateError(signInError));
  //     }
  //   } catch (e) {
  //     const message = e instanceof Error ? e.message : String(e);
  //     setError(translateError(message));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all the fields.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (!isLogin && (!name.trim() || !employeeNumber.trim())) {
      setError("Name and Employee Number are required for registration.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error: signInError } = await loginWithEmail(email, password);
        if (signInError) {
          setError(translateError(signInError));
        }
      } else {
        const projectList = projects
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
          
        const { error: signUpError } = await registerWithEmail(
          email,
          password,
          name.trim(),
          employeeNumber.trim(),
          projectList
        );
        if (signUpError) {
          setError(translateError(signUpError));
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(translateError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Main Container */}
      <div className="w-full max-w-md bg-white backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10">
        
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600/10 text-slate-500 rounded-xl mb-3 border border-slate-500/20">
           <GrUserWorker size={36} color="#0c0c0cff" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Element Safety, LLC.</h2>
          <p className="text-gray-600 text-sm mt-1">Timesheet & Invoice Portal</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white-900/60 p-1 rounded-lg mb-6 gap-2">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 border border-green-600/30 ${
              isLogin 
                ? "bg-green-600 text-white shadow-md" 
                : "text-gray-800 hover:text-green-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 border border-blue-700/30 ${
              !isLogin 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-500/30 rounded-lg flex items-start gap-2.5 text-red-200 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5 text-red-400">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full text-black pl-10 pr-4 py-2.5 bg-white/60 border border-slate-700/70 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                  Employee Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm-1.2 6.477a3 3 0 00-2.6 0 5.12 5.12 0 00-.783.476.375.375 0 00.117.658h3.866a.375.375 0 00.117-.658 5.12 5.12 0 00-.783-.476z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    placeholder="EMP001"
                    className="w-full text-black pl-10 pr-4 py-2.5 bg-white/60 border border-slate-700/70 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                  Projects (comma-separated)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                    placeholder="Project Alpha, Project Beta"
                    className="w-full text-black pl-10 pr-4 py-2.5 bg-white/60 border border-slate-700/70 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full text-black pl-10 pr-4 py-2.5 bg-white/60 border border-slate-700/70 rounded-lg text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-black pl-10 pr-10 py-2.5 bg-white/60 border border-slate-700/70 rounded-lg text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                  Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3a3.745 3.745 0 013.068 1.593 3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-800/70 rounded-lg text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isLogin ? (
              "Login"
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Divider
        <div className="relative my-6 flex items-center justify-center border-t border-gray-200">
          <span className="absolute bg-white px-3 text-xs font-semibold text-gray-500 uppercase">Or continue with</span>
        </div> */}

        {/* Google Sign In Button
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm text-black"
        >
          <FcGoogle className="w-7 h-7" />
          Sign in with Google
        </button> */}
      </div>
    </div>
  );
};

export default AuthPage;
