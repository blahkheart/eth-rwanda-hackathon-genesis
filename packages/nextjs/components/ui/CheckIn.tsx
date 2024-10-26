import React, { useState } from "react";
import { notification } from "~~/utils/scaffold-eth/notification";

export function CheckInForm({ endpoint }: { endpoint: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!email) {
      notification.error("Email is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to check in");
      }

      const result = await response.json();
      notification.success(result.message);
      setEmail(""); // Clear the input field
    } catch (error) {
      notification.error(`${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center join w-full max-w-2xl mt-8">
        <input
          className="input input-bordered join-item w-full max-w-2xl"
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
        />
        <button onClick={handleCheckIn} disabled={loading} className="btn btn-secondary join-item rounded-r-full">
          {" "}
          {loading ? "Checking in..." : "Check In"}
        </button>
      </div>
    </div>
  );
}
