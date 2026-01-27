"use client";

import { useState } from "react";

interface MenuItem {
  icon: string;
  label: string;
  onClick?: () => void;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuItems: MenuItem[] = [
    { icon: "🏠", label: "Início" },
    { icon: "👤", label: "Perfil" },
    { icon: "⚙️", label: "Configurações" },
    { icon: "📊", label: "Dashboard" },
    { icon: "💬", label: "Mensagens" },
    { icon: "🔔", label: "Notificações" },
    { icon: "🚪", label: "Sair" },
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-4 shadow-lg flex justify-between items-center relative z-50">
        <div className="text-2xl font-bold text-white tracking-tight">
          Temix.io
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl cursor-pointer hover:scale-105 transition-transform shadow-md">
            👤
          </div>

          <button
            onClick={toggleMenu}
            className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-white/30 transition-all"
          >
            <span
              className={`w-5 h-0.5 bg-white rounded transition-all ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            ></span>
            <span
              className={`w-5 h-0.5 bg-white rounded transition-all ${isMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`w-5 h-0.5 bg-white rounded transition-all ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            ></span>
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMenu}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 w-80 max-w-full h-screen bg-white shadow-2xl z-50 p-8 transition-transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
          <button
            onClick={closeMenu}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li
              key={index}
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 hover:translate-x-1 transition-all text-gray-700"
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
