import { ClockLoader } from "react-spinners";

export default function Spinner({ showSpinner }: { showSpinner: boolean }) {
  return (
    showSpinner && (
      <div className="inset-0 absolute bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
        <div className="p-4 bg-[#2AD575]">
          <ClockLoader color="#D52A8A" size={100} />
        </div>
      </div>
    )
  );
}
