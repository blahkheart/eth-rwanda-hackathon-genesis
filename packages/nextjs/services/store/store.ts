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
import classData from "./data.json";
import create from "zustand";
import { persist } from "zustand/middleware";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

type ClassData = {
  [key: string]: {
    address: string;
    description: string;
  };
};

type HackerData = {
  ethereumAddress: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  nftRequestPending?: boolean;
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
      registerHacker: (hacker: HackerData) =>
        set(state => ({
          hackers: [...state.hackers, { ...hacker, nftRequestPending: true }],
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
