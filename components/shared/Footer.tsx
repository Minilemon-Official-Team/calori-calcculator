"use client";

import { Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t shadow-inner py-6 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-col md:flex-row items-center gap-4 text-gray-600 text-xs">
        <div className="flex items-center gap-4 flex-wrap text-gray-800">
          <span>&copy; {new Date().getFullYear()} Calori Calculator</span>
          <span className="cursor-default">Privacy Policy</span>
          <span className="cursor-default">Terms & Conditions</span>
          <span className="cursor-default">Contact</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-gray-600">
        <a href="#" className="hover:text-pink-500 transition no-underline">
          <Instagram size={20} />
        </a>
        <a href="#" className="hover:text-blue-600 transition no-underline">
          <Facebook size={20} />
        </a>
        <a href="#" className="hover:text-red-600 transition no-underline">
          <Youtube size={20} />
        </a>
      </div>
    </footer>
  );
}
