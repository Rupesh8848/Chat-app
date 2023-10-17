import React from "react";
import { Link } from "react-router-dom";
export default function Landing({
  userName,
  handleChange,
  handleLogin,
}: {
  userName: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogin: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) {
  return (
    <>
      <div className="container mx-auto h-screen flex flex-col justify-center items-center ">
        <div
          className="border-2 border-gray-400 shadow-lg rounded-lg p-4 mb-8"
          style={{ backgroundColor: "#FFE5B4" }}
        >
          <h1 className=" text-4xl font-semibold mb-4">Chat-Rat</h1>
          <div className="flex flex-col ">
            <label className="text-lg mb-2">Enter your username:</label>
            <input
              type="text"
              className="border-2 border-black px-4 py-2 rounded-lg mb-4"
              onChange={handleChange}
              value={userName || ""}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              onClick={handleLogin}
            >
              Login
            </button>
            <label className="text-xs font-semibold-light mt-2 cursor-pointer underline">
              <Link to="/new-user">Create New Dispatcher?</Link>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
