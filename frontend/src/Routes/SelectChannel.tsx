import { useNavigate } from "react-router-dom";

export default function SelectChannel({ userName }: { userName: string }) {
  const navigate = useNavigate();
  return (
    <>
      <div>SelectChannel:</div>

      <div onClick={() => navigate("/public-chat", { state: { userName } })}>
        Public Chat
      </div>
      <div onClick={() => navigate("/chat", { state: { userName } })}>
        Private Chat
      </div>
    </>
  );
}
