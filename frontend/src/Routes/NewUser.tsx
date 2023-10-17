import { Link, useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";
import toast from "react-hot-toast";

const NewUser = () => {
  const [input, setInput] = React.useState("");
  const navigation = useNavigate();
  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleCreate = async () => {
    const res = await axios.post("http://localhost:8000/api/user/new-user", {
      userName: input,
    });
    if (res.data.success) {
      toast.success(res.data.message);
      setTimeout(() => {
        navigation("/");
      }, 2000);
    } else {
      toast.error(res.data.message);
    }
  };
  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center ">
      <div
        className="border-2 border-gray-400 shadow-lg rounded-lg p-4 mb-8"
        style={{ backgroundColor: "#FFE5B4" }}
      >
        <h1 className=" text-3xl font-semibold mb-5">Add New Dispatcher</h1>
        <div className="flex flex-col ">
          <label className="text-lg mb-2">Username:</label>
          <input
            type="text"
            className="border-2 border-black px-4 py-2 rounded-lg mb-4"
            onChange={handleChange}
            value={input}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={handleCreate}
          >
            Add
          </button>
          <Link to="/">
            <label className="text-xs font-semibold-light mt-2 underline cursor-pointer">
              Already a member?
            </label>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewUser;
