import { useState } from "react";

export default function PollTrigger() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendPoll = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("http://localhost:5001/api/poll/start", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Poll sent successfully!");
      } else {
        setMessage(data.error || "Failed to send poll.");
      }
    } catch (error) {
      setMessage("Error connecting to backend.",error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 w-96 text-center border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Trigger Food Poll</h2>
        <button 
          onClick={sendPoll} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? "Sending..." : "Send Poll"}
        </button>
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
