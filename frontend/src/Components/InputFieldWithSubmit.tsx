import React from "react";

export default function InputFieldWithSubmit({
  submitMessage,
  handleChange,
}: {
  submitMessage: () => Promise<void>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <input
        type="text"
        className="border-2 border-black"
        onChange={handleChange}
      />
      <button onClick={submitMessage}>Send</button>;
    </>
  );
}
