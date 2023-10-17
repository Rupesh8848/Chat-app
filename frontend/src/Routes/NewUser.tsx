import { Link } from "react-router-dom";

const NewUser = () => {
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
            // onChange={handleChange}
            // value={userName || ""}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            // onClick={handleLogin}
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
