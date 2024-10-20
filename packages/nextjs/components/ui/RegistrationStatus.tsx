import React, { useState } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
// import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth/notification";

interface RegistrationStatusProps {
  email: string;
  onClose: () => void;
  onRetry: () => void; // New prop for retry callback
  isSuccess: boolean;
}

export const RegistrationStatus: React.FC<RegistrationStatusProps> = ({ isSuccess, onClose, onRetry }) => {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      onRetry(); // Trigger the retry callback
      notification.success("Retry successful!");
    } catch (error) {
      notification.error("Retry failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSuccess) {
    return (
      <div className="p-6 my-4 bg-sky-100 rounded-lg shadow-md">
        <ExclamationCircleIcon className="w-10 h-10 text-sky-500 mb-4" />
        <p className="text-sky-700 mb-4">Registration Failed. Please try again.</p>
        <div className="flex space-x-4">
          <button
            onClick={handleRetry}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Retrying..." : "Retry"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sky-600 bg-white border border-sky-600 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div role="alert" className="p-6 bg-sky-100 rounded-lg shadow-md my-8">
      <div className="flex items-center space-x-2">
        {isSuccess && <ExclamationCircleIcon className="w-5 h-5 text-sky-500" />}
        <div className="flex flex-col">
          <div className="flex flex-col">
            <span className="text-sky-700">Hey👋</span>
            {isSuccess && <span className="text-sky-700">Registration Successful 🎉🎉🎉</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
