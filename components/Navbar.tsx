"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Sun, Moon, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

/* =========================
   NAV LINK (Restored)
========================= */
function NavLink({
  href,
  label,
  theme,
}: {
  href: string;
  label: string;
  theme: "dark" | "light";
}) {
  return (
    <Link href={href} className={`relative group text-sm cursor-pointer transition-colors ${
      theme === 'dark' 
        ? 'text-gray-300 hover:text-white' 
        : 'text-gray-700 hover:text-blue-600'
    }`}>
      {label}
      <span className={`absolute left-0 -bottom-1 h-[2px] w-0 group-hover:w-full transition-all duration-300 ${
        theme === 'dark' ? 'bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]' : 'bg-blue-600'
      }`} />
    </Link>
  );
}

export default function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const handleEnrollmentClick = () => {
    if (!user) {
      router.push('/auth/login?redirect=enroll');
      return;
    }
    router.push('/courses');
  };

  return (
    <>
      {/* =========================
          NAVBAR
      ========================= */}
      <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-[#0b0c17]/80 backdrop-blur-md border-b border-white/10' 
          : 'bg-white border-b border-gray-200 shadow-sm'
      }`}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* MOBILE LOGO + HAMBURGER (Fixed Pointer/Hover) */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setSidebar(true)}
                className="relative cursor-pointer active:scale-95 transition-transform"
              >
                <div className="h-10 w-auto flex items-center shrink-0">
                  <Image
                    src="https://i.ibb.co.com/d063XCPx/logo.jpg"
                    alt="logo"
                    width={50}
                    height={40}
                    className="object-contain w-auto h-10"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-600 p-[3px] rounded-md pointer-events-none">
                  <Menu size={14} className="text-white" />
                </div>
              </button>

              <div className="leading-tight">
                <div className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Luminous Skills
                </div>
                <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Training Center
                </div>
              </div>
            </div>

            {/* DESKTOP LOGO */}
            <Link href="/" className="hidden lg:flex items-center gap-2 cursor-pointer group">
              <div className="h-10 w-auto flex items-center shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="https://i.ibb.co.com/d063XCPx/logo.jpg"
                  alt="logo"
                  width={50}
                  height={40}
                  className="object-contain w-auto h-10"
                />
              </div>
              <div className="leading-tight">
                <div className={`text-sm font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  LUMINOUS <span className="text-blue-600 italic">CENTER</span>
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Skill Development Training
                </div>
              </div>
            </Link>
          </div>

          {/* CENTER MENU (Fixed Dropdown Clickability) */}
          <div className="hidden lg:flex items-center gap-8">
            <div
              className="relative py-4" 
              onMouseEnter={() => setCoursesOpen(true)}
              onMouseLeave={() => setCoursesOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm nav-link cursor-pointer">
                All Courses <ChevronDown size={16} className={`transition-transform ${coursesOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`absolute top-full left-0 w-64 p-4 rounded-xl transition-all duration-300 z-[100] ${
                  coursesOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible translate-y-2"
                } ${
                  theme === 'dark' 
                    ? 'bg-[#1a1c3d] border border-white/10' 
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                <div className="flex flex-col gap-3 text-sm">
                  <Link href="/courses/recorded" className={`transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}>Recorded Course</Link>
                  <Link href="/courses/online" className={`transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}>Online Live Course</Link>
                  <Link href="/courses/offline" className={`transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}>Offline Course</Link>
                  <Link href="/courses/govt" className={`transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}>Govt Project Free Course</Link>
                </div>
              </div>
            </div>

            <NavLink href="/course-details" label="Course Details" theme={theme} />
            <NavLink href="/about" label="About Us" theme={theme} />
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                theme === 'dark' 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              // Logged in user menu
              <div className="relative">
                <div
                  className="relative py-4" 
                  onMouseEnter={() => setProfileOpen(true)}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <button className="flex items-center gap-2 text-sm cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa] flex items-center justify-center text-white font-semibold">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user.firstName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${profileOpen ? 'rotate-180' : ''} ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`} />
                  </button>

                  <div
                    className={`absolute top-full right-0 w-56 p-2 rounded-xl transition-all duration-300 z-[100] ${
                      profileOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible translate-y-2"
                    } ${
                      theme === 'dark' 
                        ? 'bg-[#1a1c3d] border border-white/10' 
                        : 'bg-white border border-gray-200 shadow-lg'
                    }`}
                  >
                    <div className="flex flex-col gap-1 text-sm">
                      <div className={`px-3 py-2 text-xs font-semibold ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Signed in as
                      </div>
                      <div className={`px-3 py-2 font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.email}
                      </div>
                      <div className={`h-px my-1 ${
                        theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                      }`} />
                      
                      {/* Dashboard button */}
                      <Link 
                        href={`/${user.roleName}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          theme === 'dark' 
                            ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <LayoutDashboard size={16} />
                        {user.roleName === 'admin' ? 'Admin Dashboard' : 
                         user.roleName === 'mentor' ? 'Mentor Dashboard' : 
                         user.roleName === 'employee' ? 'Employee Dashboard' : 
                         'Student Dashboard'}
                      </Link>
                      
                      <Link 
                        href="/profile"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          theme === 'dark' 
                            ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      
                      <div className={`h-px my-1 ${
                        theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                      }`} />
                      
                      <button
                        onClick={() => {
                          logout();
                          router.push('/');
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors w-full text-left ${
                          theme === 'dark' 
                            ? 'text-red-400 hover:text-red-300 hover:bg-white/10' 
                            : 'text-red-600 hover:text-red-700 hover:bg-gray-50'
                        }`}
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Logged out user - show enroll button
              <button
                onClick={handleEnrollmentClick}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white cursor-pointer"
                style={{
                  background: theme === 'dark' 
                    ? 'linear-gradient(to right, #2F2FE4, #1e40af)'
                    : 'linear-gradient(to right, #2563eb, #1d4ed8)'
                }}
              >
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* SIDEBAR (Restored Style) */}
      <div
        onClick={() => setSidebar(false)}
        className={`fixed inset-0 bg-black/50 z-[60] transition ${
          sidebar ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 left-0 w-[300px] h-full z-[70] bg-[#1b1d4d] transition-transform duration-300 ${
          sidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <span className="font-bold text-white">Menu</span>
          <button onClick={() => setSidebar(false)} className="cursor-pointer text-white">
            <X />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 text-sm">
          <Link href="/courses/recorded" className="hover:text-[#2e31e1] transition-colors" onClick={() => setSidebar(false)}>Recorded Course</Link>
          <Link href="/courses/online" className="hover:text-[#2e31e1] transition-colors" onClick={() => setSidebar(false)}>Online Live Course</Link>
          <Link href="/courses/offline" className="hover:text-[#2e31e1] transition-colors" onClick={() => setSidebar(false)}>Offline Course</Link>
          <Link href="/courses/govt" className="hover:text-[#2e31e1] transition-colors" onClick={() => setSidebar(false)}>Govt Free Course</Link>
          <hr className="border-white/10" />
          <Link href="/courses" onClick={() => setSidebar(false)}>All Courses</Link>
          <Link href="/about" onClick={() => setSidebar(false)}>About Us</Link>
        </div>
      </div>
    </>
  );
}