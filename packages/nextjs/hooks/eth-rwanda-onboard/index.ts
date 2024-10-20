import { useMemo } from "react";
import { HackerData } from "~~/services/store/store";

export function useIsEmailRegistered(hackers: HackerData[], email: string): boolean {
  return useMemo(() => {
    return hackers.some(hacker => hacker.email === email);
  }, [hackers, email]);
}

export function useIsPhoneNumberRegistered(hackers: HackerData[], phoneNumber: string): boolean {
  return useMemo(() => {
    return hackers.some(hacker => hacker.phone === phoneNumber);
  }, [hackers, phoneNumber]);
}
