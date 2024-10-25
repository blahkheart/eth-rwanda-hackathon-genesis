"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { RegistrationModal } from "~~/components/ui/RegistrationModal";
import { RegistrationsClosedModal } from "~~/components/ui/RegistrationsClosedModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useGlobalState } from "~~/services/store/store";

const Home: NextPage = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);
  const { classData, setHackerClass, setLockAddress } = useGlobalState();

  const { data: areRegistrationsOpen } = useScaffoldReadContract({
    contractName: "ETHRwandaHackathonOnboard",
    functionName: "getAreRegistrationsOpen",
  });

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
          {/* Existing content */}
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
          </div>
        </main>

        <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedClass={selectedClass} />
        <RegistrationsClosedModal isOpen={isClosedModalOpen} onClose={() => setIsClosedModalOpen(false)} />
      </div>
    </>
  );
};

export default Home;
