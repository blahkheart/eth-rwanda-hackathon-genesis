"use client";

import { useEffect, useState } from "react";
import { CheckInForm } from "./CheckIn";

type CountdownTimerProps = {
  onComplete?: () => void;
};

export default function CountdownTimer({ onComplete }: CountdownTimerProps) {
  const calculateInitialTime = (): number => {
    const now = new Date();
    const target = new Date();
    target.setHours(15, 0, 0, 0); // Set target time to 2 PM today

    const timeDifference = target.getTime() - now.getTime();
    const initialTimeInSeconds = Math.max(0, Math.floor(timeDifference / 1000));

    return initialTimeInSeconds;
  };

  const [timeLeft, setTimeLeft] = useState(calculateInitialTime());

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (time: number): { hours: string; minutes: string; seconds: string } => {
    if (isNaN(time) || time < 0) return { hours: "00", minutes: "00", seconds: "00" };

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden">
      {timeLeft > 0 ? (
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
