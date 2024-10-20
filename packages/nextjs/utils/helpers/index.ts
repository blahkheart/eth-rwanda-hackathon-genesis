import { ethers } from "ethers";

function isValidEthereumAddress(address: string): boolean {
  try {
    ethers.getAddress(address); // Automatically throws if the address is invalid
    return true;
  } catch (error) {
    return false;
  }
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\d+$/;
  return phoneRegex.test(phone);
};

export { isValidEthereumAddress, isValidEmail, isValidPhoneNumber };
