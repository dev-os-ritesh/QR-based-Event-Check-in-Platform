import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { loginUser } from "@/services/authService";
import { showToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, KeyRound, ArrowLeft, Sparkles, QrCode, Shield, Ticket } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  // ── Handle form submission ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      login(data.user, data.token); // Save user to global context state
      showToast(`Welcome back, ${data.user.name}! 👋`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-zinc-950 transition-colors duration-300">
      
      {/* ── LEFT COLUMN: BRAND MARKETING BANNER ─────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        {/* Dot Grid */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        {/* Top Header */}
        <div className="relative z-10">
          <span onClick={() => navigate("/")} className="text-2xl font-black tracking-tight text-indigo-400 cursor-pointer hover:opacity-90">
            TicketPass 🎫
          </span>
        </div>

        {/* Core Marketing Details */}
        <div className="relative z-10 max-w-md my-auto space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <Sparkles className="size-3.5" /> Experience Events Seamlessly
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
              Welcome back <br />
              to <span className="text-indigo-400">TicketPass</span>
            </h2>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Log in to access your registered tickets, manage event rosters, scan QR codes, and view real-time check-in stats.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
              <Ticket className="size-5 text-indigo-400 shrink-0" />
              <span>Contactless entry & booking history</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
              <QrCode className="size-5 text-indigo-400 shrink-0" />
              <span>Instant secure QR codes & PDF tickets</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
              <Shield className="size-5 text-indigo-400 shrink-0" />
              <span>Decoupled security & role access</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-zinc-500 font-semibold">
          &copy; {new Date().getFullYear()} TicketPass. All rights reserved.
        </div>
      </div>

      {/* ── RIGHT COLUMN: LOGIN FORM PANEL ─────────────────────────────── */}
      <div className="relative flex flex-col justify-between p-8 lg:p-12 min-h-screen">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate("/")} 
          className="self-start flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 shadow-sm"
        >
          <ArrowLeft className="size-4" /> Back to events
        </button>

        {/* Centered Form */}
        <div className="w-full max-w-sm mx-auto my-auto space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Sign In</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-10 py-6 rounded-xl border-zinc-200 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-10 py-6 rounded-xl border-zinc-200 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm" 
                  required 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-xl shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.01] active:scale-95 text-sm"
            >
              {loading ? "Signing in..." : "Continue"}
            </Button>
          </form>

          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Mobile footer backup */}
        <div className="lg:hidden text-center text-xs text-zinc-400 font-semibold pt-4">
          &copy; {new Date().getFullYear()} TicketPass. All rights reserved.
        </div>

      </div>
    </div>
  );
}
