"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckInForm } from "~~/components/ui/CheckIn";
import { CountdownTimer } from "~~/components/ui/CountDownTimer";
import { RegistrationModal } from "~~/components/ui/RegistrationModal";
import { RegistrationsClosedModal } from "~~/components/ui/RegistrationsClosedModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useGlobalState } from "~~/services/store/store";

const Home: NextPage = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const { classData, setHackerClass, setLockAddress } = useGlobalState();
  const { address: connectedAddress } = useAccount();

  const { data: areRegistrationsOpen, isLoading } = useScaffoldReadContract({
    contractName: "ETHRwandaHackathonOnboard",
    functionName: "getAreRegistrationsOpen",
  });

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "ETHRwandaHackathonOnboard",
    functionName: "owner",
  });

  useEffect(() => {
    if (connectedAddress && ownerAddress) {
      setIsOwner(connectedAddress.toLowerCase() === ownerAddress.toLowerCase());
    }
  }, [connectedAddress, ownerAddress]);

  useEffect(() => {
    const defaultClass = "University";
    if (classData[defaultClass]) {
      setHackerClass(defaultClass);
      setLockAddress(classData[defaultClass].address);
    }
  }, [classData, setHackerClass, setLockAddress]);

  const openModal = (classType: string) => {
    if (areRegistrationsOpen) {
      setSelectedClass(classType);
      setHackerClass(classType);
      setLockAddress(classData[classType].address);
      setIsModalOpen(true);
    } else {
      setIsClosedModalOpen(true);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-green-50">
        <main>
          <div
            className="relative h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('/ETH-Rwanda-Banner.jpeg')" }}
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10 text-center text-white">
              <h1 className="text-6xl font-bold mb-4  text-gray-200">ETH RWANDA HACKATHON</h1>
              <p className="mt-12 text-4xl font-extrabold ">GENESIS</p>
              {/* Action Buttons */}
              <div className="flex mt-32 justify-center space-x-8">
                {/* Ethereum Logo */}
                <svg className="w-16 h-16" viewBox="0 0 784.37 1277.39" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <polygon
                      fill="#ffffff"
                      fillRule="nonzero"
                      points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54 "
                    />
                    <polygon
                      fill="#ffffff"
                      fillRule="nonzero"
                      points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33 "
                    />
                    <polygon
                      fill="#ffffff"
                      fillRule="nonzero"
                      points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89 "
                    />
                    <polygon fill="#ffffff" fillRule="nonzero" points="392.07,1277.38 392.07,956.52 -0,724.89 " />
                    <polygon fill="#ffffff" fillRule="nonzero" points="392.07,882.29 784.13,650.54 392.07,472.33 " />
                    <polygon fill="#ffffff" fillRule="nonzero" points="0,650.54 392.07,882.29 392.07,472.33 " />
                  </g>
                </svg>
                {/* Smart Contract Icon */}
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                {/* Blockchain Icon */}
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">
                  ETH <span className="text-green-600">RWANDA</span>
                </span>
              </h2>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Join us for a symbolic event in the development of the Ethereum ecosystem in Rwanda. Learn, build, and
                shape the future of blockchain technology.
              </p>
            </div>
            <div className="flex items-center justify-centerp-4 flex-col">
              <CountdownTimer initialSeconds={0} />
              {isOwner && (
                <div className="mt-2 pt-1">
                  <CheckInForm endpoint="/api/checkin/inperson" />
                </div>
              )}
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-xs"></span>
              </div>
            ) : (
              <div className="mt-16">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Choose Your Hacker Class</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(classData).map(([className, { description }]) => (
                    <div
                      key={className}
                      className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
                      onClick={() => openModal(className)}
                    >
                      <Image
                        src="/eth-rwanda-img.jpg?height=200&width=200"
                        alt={className}
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{className}</h3>
                        <p className="mt-1 text-sm text-gray-500">{description}</p>
                      </div>
                      <div className="absolute top-0 right-0 m-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                        NFT
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedClass={selectedClass} />
        <RegistrationsClosedModal isOpen={isClosedModalOpen} onClose={() => setIsClosedModalOpen(false)} />
      </div>
    </>
  );
};

export default Home;
