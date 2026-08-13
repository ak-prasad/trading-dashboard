"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LineChart, Mail, Lock, Eye, EyeOff, ShieldCheck, PieChart, TrendingUp, LogIn } from "lucide-react";
import { useTheme } from "@/components/Providers";
import styles from "./page.module.css";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Agar user already logged in hai, toh turant dashboard par bhej do
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Custom Email/Password login handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      alert("For real-time Google Sheets sync, please use the 'Google' button below!");
    }, 1000);
  };

  if (status === "loading") {
    return (
      <div className={`${styles.loginContainer} ${resolvedTheme === "dark" ? styles.darkTheme : styles.lightTheme} flex items-center justify-center`}>
        <p className="text-sm font-medium animate-pulse text-emerald-400">Loading Trading Journal...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.loginContainer} ${resolvedTheme === "dark" ? styles.darkTheme : styles.lightTheme}`}>
      
      {/* Left Side Hero Panel */}
      <div className={styles.leftHeroPanel}>
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-500/20">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">TRADING</h1>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-widest">DASHBOARD</p>
          </div>
        </div>

        <div className="space-y-6 max-w-lg">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              Track. Analyze.<br />
              <span className="text-emerald-400">Trade. Succeed.</span>
            </h2>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Your all-in-one platform to track performance, analyze trends and maximize profits directly connected with your Google Sheets.
            </p>
          </div>

          <div className="space-y-3">
            <div className={styles.featureBox}>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
              <div>
                <h4 className="text-xs font-semibold">Real-time Analytics</h4>
                <p className="text-[11px] text-gray-400">Get live insights and performance overview.</p>
              </div>
            </div>

            <div className={styles.featureBox}>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><PieChart className="w-4 h-4" /></div>
              <div>
                <h4 className="text-xs font-semibold">Smart Reports</h4>
                <p className="text-[11px] text-gray-400">Detailed reports to make better decisions.</p>
              </div>
            </div>

            <div className={styles.featureBox}>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><ShieldCheck className="w-4 h-4" /></div>
              <div>
                <h4 className="text-xs font-semibold">Secure & Reliable</h4>
                <p className="text-[11px] text-gray-400">Bank-level security for your data safety.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Vertical Divider with Theme Glow */}
      <div className="hidden lg:block w-[1.5px] h-[65vh] bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent"></div>

      {/* Right Side Login Form Panel */}
      <div className={styles.rightFormPanel}>
        <div className={styles.loginCard}>
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 text-white shadow-lg shadow-emerald-500/20">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Welcome Back!</h3>
            <p className="text-xs text-gray-400 mt-1">Login to access your trading dashboard</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.inputBox}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputBox}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-700 bg-transparent text-emerald-500 focus:ring-0" 
                />
                Remember me
              </label>
              <a href="#" className="text-emerald-400 hover:underline">Forgot Password?</a>
            </div>

            <button type="submit" disabled={loading} className={styles.loginButton}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-700/50"></div>
            <span className="px-3 text-[10px] text-gray-500 uppercase tracking-widest">or continue with</span>
            <div className="flex-1 border-t border-gray-700/50"></div>
          </div>

          {/* Functional Google Login Button */}
          <button 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className={styles.googleButton}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.14C3.18 21.31 7.23 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.19C.43 8.15 0 9.89 0 12s.43 3.85 1.19 5.38l4.08-3.14z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.18 2.69 1.19 6.62l4.08 3.14c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            Google
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            Don't have an account? <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">Sign up</span>
          </p>

        </div>
      </div>

    </div>
  );
}