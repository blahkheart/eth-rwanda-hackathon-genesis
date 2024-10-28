"use client";

import { useEffect, useState } from "react";
import { CheckInForm } from "./CheckIn";

interface CountdownTimerProps {
  initialSeconds: number;
}

export function CountdownTimer({ initialSeconds }: CountdownTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const intervalId = setInterval(() => {
      setRemainingSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [remainingSeconds]);

  const formatTime = (_seconds: number) => {
    const hours = Math.floor(_seconds / 3600);
    const minutes = Math.floor((_seconds % 3600) / 60);
    const seconds = _seconds % 60;
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatTime(remainingSeconds);

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden">
      {remainingSeconds > 0 ? (
        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Online Check-in closes in </h2>
          <div className="flex justify-center items-center space-x-4 sm:space-x-8">
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-6xl font-bold text-primary tabular-nums" aria-live="polite">
                {hours}
              </span>
              <span className="text-sm sm:text-base text-gray-600 mt-1">Hours</span>
            </div>
            <span className="text-4xl sm:text-6xl font-bold text-gray-400">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-6xl font-bold text-primary tabular-nums" aria-live="polite">
                {minutes}
              </span>
              <span className="text-sm sm:text-base text-gray-600 mt-1">Minutes</span>
            </div>
            <span className="text-4xl sm:text-6xl font-bold text-gray-400">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-6xl font-bold text-primary tabular-nums" aria-live="polite">
                {seconds}
              </span>
              <span className="text-sm sm:text-base text-gray-600 mt-1">Seconds</span>
            </div>
          </div>
          <CheckInForm endpoint="/api/checkin/online" />
        </div>
      ) : (
        <p className="mt-6 text-xl font-semibold text-center text-gray-700">Online Check-in is now closed</p>
      )}
    </div>
  );
}
