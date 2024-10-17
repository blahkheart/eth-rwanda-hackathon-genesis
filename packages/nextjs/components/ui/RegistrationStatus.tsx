import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { useGlobalState } from "~~/services/store/store";

interface RegistrationStatusProps {
  email: string;
}

export const RegistrationStatus: React.FC<RegistrationStatusProps> = ({ email }) => {
  const { hackers } = useGlobalState();

  const hacker = hackers.find(hacker => hacker.email === email);

  if (!hacker) {
    return (
      <div>
        <ExclamationCircleIcon className="w-10 h-10 text-yellow-500" />
        Registration Failed. Please try again.
      </div>
    );
  }

  return (
    <div role="alert" className="alert alert-warning my-8">
      <div className="flex items-center space-x-2">
        {hacker.isNftMinted && <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />}
        <div className="flex flex-col">
          <div className="flex flex-col">
            <span>Hey👋</span>
            {!hacker.isNftMinted && (
              <span>
                {" "}
                Registration is Successful. <strong>⚠️ </strong>NFT minting is pending.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
