"use client";

import { useState, useEffect, memo } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#integrations", label: "Ecosystem" },
  { href: "#testimonials", label: "Testimonials" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine if a hash link is active
  const isActive = (href: string) => {
    if (href.startsWith("#")) {
      // For client-side hash links, check if the hash is in the URL
      return typeof window !== "undefined" && window.location.hash === href;
    }
    return pathname === href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/70 shadow-md backdrop-blur-md border-b border-purple-100/50"
          : "bg-white/50 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 py-3 lg:py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 relative z-10 group transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/logo.svg"
            alt="Compensate"
            width={180}
            height={32}
            priority
            className="transition-all duration-300"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <div className="flex items-center space-x-1 lg:space-x-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 rounded-md text-sm lg:text-base font-medium transition-all duration-300 
                  ${
                    isActive(link.href)
                      ? "text-purple-800 bg-purple-50/80"
                      : "text-gray-700 hover:text-purple-700 hover:bg-purple-50/50"
                  }
                  after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-purple-500 
                  after:transition-all after:duration-300 hover:after:w-4/5`}
                prefetch={false}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Button
            name="Connect now"
            className="ml-2 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          />
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="md:hidden relative z-10 p-2 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 text-purple-700" />
          ) : (
            <Menu className="h-5 w-5 text-purple-700" />
          )}
        </button>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-lg z-0 md:hidden flex flex-col items-center justify-center gap-8 pt-20  duration-300">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xl font-medium relative px-4 py-2 rounded-md transition-all
                  ${
                    isActive(link.href)
                      ? "text-purple-800 bg-purple-50/70"
                      : "text-gray-800 hover:text-purple-700"
                  }
                  after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
                  after:w-0 after:h-0.5 after:bg-purple-500 after:transition-all after:duration-300
                  hover:after:w-1/2`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4">
              <Button name="Connect now" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default memo(Navbar);
