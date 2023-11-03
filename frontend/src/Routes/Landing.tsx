import React from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../Components/Spinner";
export default function Landing({
  userName,
  handleChange,
  handleLogin,
  loading,
  resetUserName,
}: {
  userName: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogin: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  loading: boolean;
  resetUserName: () => void;
}) {
  React.useEffect(() => {
    if (userName) {
      location.reload();
    }
    if (localStorage.getItem("loggedOut") === "true") {
      localStorage.clear();
      location.reload();
    }
  }, []);
  const navigate = useNavigate();
  const handleNavigateToNewDisptacher = () => {
    resetUserName();
    navigate("/new-user");
  };

  return (
    <>
      <div className="container mx-auto h-screen flex flex-col justify-center items-center ">
        <Spinner showSpinner={loading} />
        <div
          className="border-2 border-gray-400 shadow-lg rounded-lg p-8 mb-8"
          style={{ backgroundColor: "#FFE5B4" }}
        >
          <h1 className=" text-4xl font-semibold mb-4">Login into Chat-Rat</h1>
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
              <span onClick={handleNavigateToNewDisptacher}>
                Create new dispatcher?
              </span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
