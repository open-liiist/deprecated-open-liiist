"use client";
import React from "react";
import Link from "next/link";
import { GoArrowDownRight, GoPlus } from "react-icons/go";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-liiist_green text-liiist_white">
      {/* Main container centered with left alignment */}
      <main className="w-full max-w-md flex flex-col items-start space-y-6">
        {/* Title */}
        <h1 className="text-5xl font-bold">liiist</h1>
        {/* Tagline */}
        <p className="text-xl max-w-lg">Find the best place for grocery shopping</p>

        {/* Individual options */}
        <div className="flex flex-col space-y-4">
          {/* Sign In option */}
          <Link href="/sign-in">
            <div className="flex items-center gap-5 p-4 bg-liiist_white rounded-full w-full text-left hover:bg-gray-200 transition">
              <span className="text-2xl flex-grow text-gray-800">Sign In</span>
              <div className="p-2 rounded-full bg-liiist_green hover:bg-gray-800 transition">
                <GoArrowDownRight size={36} />
              </div>
            </div>
          </Link>

          {/* Sign Up option */}
          <Link href="/sign-up">
            <div className="flex items-center gap-5 p-4 bg-liiist_white rounded-full w-full text-left hover:bg-gray-200 transition">
              <span className="text-2xl flex-grow text-gray-800">Sign Up</span>
              <div className="p-2 rounded-full bg-liiist_green hover:bg-gray-800 transition">
                <GoPlus size={25} />
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 w-full max-w-md text-liiist_white text-center">
        <p className="text-liiist_white text-left">
          © 2025{" "}
          <a href="https://github.com/open-liiist" className="underline hover:text-blue-500">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
