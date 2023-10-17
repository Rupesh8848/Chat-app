import { Link, useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
// import { FileUploader } from "react-drag-drop-files";
import { storage } from "../firebase";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";

const NewUser = () => {
  const [input, setInput] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [error, setError] = React.useState<string | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);

  const ImageListRef = ref(storage, "images/");

  // const fileTypes = ["JPG", "PNG", "GIF"];
  const navigation = useNavigate();
  const handleChange = (e) => {
    setInput(e.target.value);
    setError(null);
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
    setFileError(null);
  };

  const handleCreate = async () => {
    if ((input || input.trim().length > 0) && file) {
      const ImageRef = ref(storage, `images/${file + v4()}`);
      uploadBytes(ImageRef, file).then((response) => {
        alert("Image Uploaded");
        getDownloadURL(response.ref).then(async (url) => {
          console.log(url);
          const res = await axios.post(
            "http://localhost:8000/api/user/new-user",
            {
              userName: input,
              profilePic: url,
            }
          );
          if (res.data.success) {
            toast.success(res.data.message);
            setTimeout(() => {
              navigation("/");
            }, 2000);
          } else {
            toast.error(res.data.message);
          }
        });
      });
    }
    if (!input) {
      setError("Username is required");
      return;
    }

    if (!file) {
      setFileError("Please upload your profile picture.");
      return;
    }
  };

  React.useEffect(() => {
    listAll(ImageListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          console.log(url);
        });
      });
    });
  }, []);
  return (
    <div className="container mx-auto h-screen flex flex-col justify-center items-center ">
      <div
        className="border-2 border-gray-400 shadow-lg rounded-lg p-6 mb-8"
        style={{ backgroundColor: "#FFE5B4" }}
      >
        <h1 className=" text-3xl font-semibold mb-5">Add New Dispatcher</h1>
        <div className="flex flex-col ">
          <label className="text-lg mb-1">Username:</label>
          <input
            type="text"
            className="border-2 border-black px-4 py-2 rounded-lg mb-3"
            onChange={handleChange}
            value={input}
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <div className="mb-2">
            <label className="text-lg mb-2">Profile Picture:</label>
            <div className="border-2 border-gray-400 border-dashed p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                required
              />
            </div>
            {/* <FileUploader
              multiple={false}
              handleChange={handleFileUpload}
              types={fileTypes}
              name={file}
            /> */}
          </div>
          {fileError && <p className="text-red-500 mb-2">{fileError}</p>}

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
