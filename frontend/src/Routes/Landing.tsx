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
      <div>
        Enter your username:
        <input
          type="text"
          className="border-2 border-black"
          onChange={handleChange}
          value={userName || ""}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </>
  );
}
