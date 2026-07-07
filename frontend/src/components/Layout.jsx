import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  Calendar,
  Ticket,
  BarChart3,
  PlusCircle,
  CheckSquare,
  LogOut,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Mail,
  ArrowRight
} from "lucide-react";

// Custom inline SVG icons since lucide-react no longer bundles brand logos
const GithubIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Theme state switcher loaded from localStorage or system theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <span onClick={() => navigate("/")} className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 cursor-pointer tracking-tight hover:opacity-90 transition-opacity">
              TicketPass 🎫
            </span>
            <nav className="flex gap-1">
              <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                <Calendar className="size-4" /> Events
              </Link>
              {user && (user.role === "organizer" ? (
                <>
                  <Link to="/organizer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                    <BarChart3 className="size-4" /> Stats
                  </Link>
                  <Link to="/create-event" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                    <PlusCircle className="size-4" /> Create
                  </Link>
                  <Link to="/scanner" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                    <CheckSquare className="size-4" /> Scanner
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                  <Ticket className="size-4" /> My Tickets
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="rounded-full text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
            </Button>

            {user ? (
              <>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hidden sm:inline-block">
                  {user?.name} <span className="text-xs text-zinc-400 font-normal">({user?.role})</span>
                </span>
                <Button onClick={logout} variant="outline" size="sm" className="flex items-center gap-1.5">
                  <LogOut className="size-3.5" /> Sign Out
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => navigate("/login")} variant="ghost" size="sm" className="flex items-center gap-1 text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
                  <LogIn className="size-3.5" /> Log In
                </Button>
                <Button onClick={() => navigate("/register")} size="sm" className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
                  <UserPlus className="size-3.5" /> Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                TicketPass 🎫
              </span>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Empowering event organizers and attendees with secure, seamless QR-code based ticketing and check-in experiences.<br />Made by Ritesh Ranbaware.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-4 tracking-wider uppercase">Explore</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">All Events</Link>
                </li>
                {user?.role === "organizer" ? (
                  <>
                    <li>
                      <Link to="/organizer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Organizer Stats</Link>
                    </li>
                    <li>
                      <Link to="/create-event" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Create Event</Link>
                    </li>
                    <li>
                      <Link to="/scanner" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">QR Scanner</Link>
                    </li>
                  </>
                ) : user ? (
                  <li>
                    <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">My Registrations</Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Login / Register</Link>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-4 tracking-wider uppercase">Categories</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/?category=technology" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Technology</Link>
                </li>
                <li>
                  <Link to="/?category=music" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Music</Link>
                </li>
                <li>
                  <Link to="/?category=sports" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sports</Link>
                </li>
                <li>
                  <Link to="/?category=business" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Business</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 tracking-wider uppercase">Stay Updated</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Subscribe to get notifications about the best upcoming events in your city.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="Your email"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                  />
                </div>
                <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-transform hover:scale-105 active:scale-95">
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </div>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} TicketPass. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><TwitterIcon className="size-4" /></a>
              <a href="#" className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><GithubIcon className="size-4" /></a>
              <a href="#" className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><LinkedinIcon className="size-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
