import React from "react";

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
        <h1 className="text-4xl font-bold mb-8">Chat-Rat</h1>
        <div className="flex flex-col items-center">
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
        </div>
      </div>
    </>
  );
}
