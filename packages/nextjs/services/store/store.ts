/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * The store includes:
 * - classData: Object containing information about hacker classes
 * - selectedClass: Currently selected hacker class
 * - lockAddress: Address of the selected class's lock
 */
import { useEffect } from "react";
import classData from "./data.json";
import create from "zustand";
import { persist } from "zustand/middleware";
import scaffoldConfig from "~~/scaffold.config";
// import clientPromise from "~~/utils/mongodb";
// import dbConnect from "~~/services/mongodb/dbConnect";
// import connectToDatabase from "~~/utils/connectToDatabase";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";
import loadHackersFromFile from "~~/utils/scaffold-eth/loadHackersDataFromFile";

type ClassData = {
  [key: string]: {
    address: string;
    description: string;
  };
};

export type HackerData = {
  ethereumAddress: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  classNftAddress: string;
  isNftMinted?: boolean;
};

type GlobalState = {
  classData: ClassData;
  selectedClass: string | null;
  lockAddress: string | null;
  setHackerClass: (className: string) => void;
  setLockAddress: (address: string) => void;
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setIsNativeCurrencyFetching: (newIsNativeCurrencyFetching: boolean) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  hackers: HackerData[];
  setHackers: (hackers: HackerData[]) => void;
  registerHacker: (hacker: HackerData) => void;
  editHackerData: (hackerAddress: string, updatedData: Partial<HackerData>) => void;
};

export const useGlobalState = create<GlobalState>()(
  persist(
    set => ({
      classData,
      selectedClass: null,
      lockAddress: null,
      setHackerClass: className => set({ selectedClass: className }),
      setLockAddress: address => set({ lockAddress: address }),
      nativeCurrency: {
        price: 0,
        isFetching: true,
      },
      setNativeCurrencyPrice: (newValue: number): void =>
        set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
      setIsNativeCurrencyFetching: (newValue: boolean): void =>
        set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
      targetNetwork: scaffoldConfig.targetNetworks[0],
      setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
      hackers: [],
      setHackers: (hackers: HackerData[]) => set({ hackers }),
      registerHacker: (hacker: HackerData) =>
        set(state => ({
          hackers: [...state.hackers, { ...hacker, isNftMinted: false }],
        })),
      editHackerData: (hackerAddress: string, updatedData: Partial<HackerData>) =>
        set(state => ({
          hackers: state.hackers.map(hacker =>
            hacker.ethereumAddress === hackerAddress ? { ...hacker, ...updatedData } : hacker,
          ),
        })),
    }),
    {
      name: "global-state",
    },
  ),
);

// Custom hook to initialize the store with data from MongoDB
export const useInitializeStore = () => {
  const setHackers = useGlobalState(state => state.setHackers);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/hackers");
        if (!response.ok) {
          console.error("Failed to fetch hackers from API");
          console.error("Loading hackers from file...");
          const hackers = await loadHackersFromFile();
          if (!hackers) {
            return console.error("Failed to fetch hackers from both API and file");
          }
          setHackers(hackers);
        }
        const hackers = await response.json();
        const formattedHackers: HackerData[] = hackers.map((hacker: any) => ({
          ethereumAddress: hacker.ethereumAddress as string,
          name: hacker.name as string,
          email: hacker.email as string,
          phone: hacker.phone as string,
          class: hacker.class as string,
          classNftAddress: hacker.classNftAddress as string,
          isNftMinted: hacker.nftRequestPending ?? false, // Default to false if undefined
        }));
        setHackers(formattedHackers);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchData();
  }, [setHackers]);
};
