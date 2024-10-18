import React, { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { z } from "zod";
import { RegistrationStatus } from "~~/components/ui/RegistrationStatus";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth/notification";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  ethereumAddress: z.string().optional(),
  class: z.string().min(1, "Class is required"),
});

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: string;
}

export function RegistrationModal({ isOpen, onClose, selectedClass }: RegistrationModalProps) {
  const { address: connectedAddress } = useAccount();
  const { lockAddress } = useGlobalState();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    ethereumAddress: "",
    class: lockAddress,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showRegistrationStatus, setShowRegistrationStatus] = useState(false);
  const { hackers } = useGlobalState();

  const isUserRegistered = (email: string): boolean => {
    return hackers.some(hacker => hacker.email === email);
  };

  const handleSubmit = async () => {
    if (isUserRegistered(formData.email)) {
      notification.warning("Email already registered.");
      return;
    }

    try {
      registrationSchema.parse(formData);
      setFormErrors({});
      // Store user data in Zustand store
      useGlobalState
        .getState()
        .registerHacker({ ...formData, class: selectedClass, classNftAddress: lockAddress ?? zeroAddress });
      // Make API call
      const response = await submitRegistrationForm({
        ...formData,
        class: selectedClass,
        classNftAddress: lockAddress ?? zeroAddress,
      });
      console.log("Registration response:", response);
      setShowRegistrationStatus(true); // Show RegistrationStatus on successful registration
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = Object.fromEntries(
          Object.entries(error.formErrors.fieldErrors).map(([key, value]) => [key, value?.[0] || ""]),
        );
        setFormErrors(formattedErrors);
      }
    } finally {
      !formErrors && handleClose();
    }
  };

  const handleClose = () => {
    setShowRegistrationStatus(false);
    onClose();
    setFormErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setShowRegistrationStatus(false);
  };

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      class: lockAddress || "",
      ethereumAddress: connectedAddress || prevData.ethereumAddress,
    }));
  }, [lockAddress, connectedAddress]);

  async function submitRegistrationForm(data: {
    name: string;
    email: string;
    phone: string;
    ethereumAddress?: string;
    class: string;
    classNftAddress: string;
  }): Promise<void> {
    setLoading(true); // Set loading to true when the request starts
    try {
      // const response = await fetch("/api/register", {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, classNftAddress: lockAddress }),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }
      const result = await response.json();
      notification.success("Registration Complete!"); // Show success notification
      console.log("Registration successful:", result);
      handleClose(); // Close the modal and reset the form
    } catch (error) {
      // const errorMessage = (error as Error).message; // Type assertion to Error
      notification.error("Registration successful! NFT request failed."); // Show error notification
      setShowRegistrationStatus(true);
      console.error("Error during registration:", error);
    } finally {
      setLoading(false); // Set loading to false when the request completes
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full mx-4  text-left">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {showRegistrationStatus && <RegistrationStatus email={formData.email} />}
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Register as {selectedClass}</h3>
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
                <form className="space-y-4 text-left">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="ethereumAddress" className="block text-sm font-medium text-gray-700">
                      Ethereum Address (optional)
                    </label>
                    <input
                      type="text"
                      id="ethereumAddress"
                      name="ethereumAddress"
                      value={formData.ethereumAddress}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                      Chosen Class
                    </label>
                    <input
                      type="text"
                      id="class"
                      value={selectedClass}
                      disabled
                      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : "Register"}
            </button>
            <button
              onClick={handleClose}
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
