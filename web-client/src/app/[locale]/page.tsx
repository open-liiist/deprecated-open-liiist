"use client";
import React from "react";
import Link from "next/link";
import { GoArrowDownRight, GoPlus } from "react-icons/go";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-liiist_green text-liiist_white">
      {/* Contenitore principale centrato ma con allineamento a sinistra */}
      <main className="w-full max-w-md flex flex-col items-start space-y-6">
        {/* Titolo */}
        <h1 className="text-5xl font-bold">liiist</h1>
        {/* Motto */}
        <p className="text-xl max-w-lg">Trova il miglior posto dove fare la spesa</p>

        {/* Singoli Tag */}
        <div className="flex flex-col space-y-4">
          {/* Sign In Tag */}
          <Link href="/sign-in">
            <div className="flex items-center gap-5 p-4 bg-liiist_white rounded-full w-full text-left hover:bg-gray-200 transition">
              <span className="text-2xl flex-grow text-gray-800">Accedi</span>
              <div className="p-2 rounded-full bg-liiist_green  hover:bg-gray-800 transition">
                <GoArrowDownRight size={36} />
              </div>
            </div>
          </Link>

          {/* Sign Up Tag */}
          <Link href="/sign-up">
            <div className="flex items-center gap-5 p-4 bg-liiist_white rounded-full w-full text-left hover:bg-gray-200 transition">
              <span className="text-2xl flex-grow text-gray-800">Registrati</span>
              <div className="p-2 rounded-full bg-liiist_green hover:bg-gray-800  transition">
                <GoPlus className="hover: " size={25}/>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 w-full max-w-md text-liiist_white text-center">
        <p className="text-liiist_white text-left">© 2025 by COMIC SANS BOLD PRO - <a href="https://github.com/open-liiist" className="underline hover:text-blue-500">GitHub
</a></p>
      </footer>
    </div>
  );
}
