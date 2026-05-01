"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";

/* =========================
   NAV LINK (Restored)
========================= */
function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link href={href} className="nav-link relative group text-sm cursor-pointer">
      {label}
      <span className="absolute left-0 -bottom-1 h-[2px] w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-[#2e31e1] to-[#162e8a]" />
    </Link>
  );
}

export default function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  return (
    <>
      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* MOBILE LOGO + HAMBURGER (Fixed Pointer/Hover) */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setSidebar(true)}
                className="relative cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-14 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                  <Image
                    src="https://i.ibb.co/d063XCPx/logo.jpg"
                    alt="logo"
                    width={56}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#2e31e1] p-[3px] rounded-md pointer-events-none">
                  <Menu size={14} />
                </div>
              </button>

              <div className="leading-tight">
                <div className="text-xs font-semibold">Luminous Skills Development</div>
                <div className="text-[10px] text-white/60">Training Center</div>
              </div>
            </div>

            {/* DESKTOP LOGO */}
            <Link href="/" className="hidden lg:flex items-center gap-2 cursor-pointer">
              <div className="w-14 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                <Image
                  src="https://i.ibb.co/d063XCPx/logo.jpg"
                  alt="logo"
                  width={56}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">
                  Luminous Skills Development Training Center
                </div>
                <div className="text-xs text-white/60">
                  Empowering Future Professionals
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
                className={`absolute top-full left-0 w-64 p-4 rounded-xl glass transition-all duration-300 z-[100] ${
                  coursesOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible translate-y-2"
                }`}
              >
                <div className="flex flex-col gap-3 text-sm">
                  <Link href="#" className="dropdown-item">Recorded Course</Link>
                  <Link href="#" className="dropdown-item">Online Live Course</Link>
                  <Link href="#" className="dropdown-item">Offline Course</Link>
                  <Link href="#" className="dropdown-item">Govt Project Free Course</Link>
                </div>
              </div>
            </div>

            <NavLink href="/course-details" label="Course Details" />
            <NavLink href="/about" label="About Us" />
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg glass cursor-pointer hover:bg-white/10"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              href="/enroll"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#2e31e1] to-[#162e8a] hover:opacity-90 transition-opacity"
            >
              Enroll Now
            </Link>
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
          <Link href="#" className="hover:text-[#2e31e1] transition-colors" onClick={() => setSidebar(false)}>Recorded Course</Link>
          <Link href="#" className="hover:text-[#2e31e1] transition-colors" onClick={() => setSidebar(false)}>Online Live Course</Link>
          <Link href="#" className="hover:text-[#2e31e1] transition-colors" onClick={() => setSidebar(false)}>Offline Course</Link>
          <Link href="#" className="hover:text-[#2e31e1] transition-colors" onClick={() => setSidebar(false)}>Govt Free Course</Link>
          <hr className="border-white/10" />
          <Link href="/course-details" onClick={() => setSidebar(false)}>Course Details</Link>
          <Link href="/about" onClick={() => setSidebar(false)}>About Us</Link>
        </div>
      </div>
    </>
  );
}