"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useEthersSigner } from "~~/hooks/scaffold-eth/useEthersSigner";
import { notification } from "~~/utils/scaffold-eth";

function InitializeHackerProfile() {
  const [signature, setSignature] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { address: userAddress } = useAccount();
  const signer = useEthersSigner();
  const { targetNetwork } = useTargetNetwork();

  const { data: hackerContract } = useScaffoldContract({
    contractName: "ETHRwandaHackathonOnboard",
  });

  // Fetch the current nonce from the contract
  const { data: currentNonce, isLoading: isNonceLoading } = useScaffoldReadContract({
    contractName: "ETHRwandaHackathonOnboard",
    functionName: "getHackerNonce",
    args: [userAddress],
    watch: true,
  });

  console.log("hackerContract_Addy", hackerContract?.address);
  const domain = {
    name: "ETHRwandaHackathon",
    version: "1",
    chainId: targetNetwork.id,
    verifyingContract: hackerContract?.address,
  };

  const types = {
    Hacker: [
      { name: "hackerAddress", type: "address" },
      { name: "nonce", type: "uint256" },
    ],
  };

  const generateSignature = async () => {
    if (!userAddress || !signer) {
      notification.error("Wallet not connected");
      return;
    }

    setIsLoading(true);

    try {
      // Data to sign
      const message = {
        hackerAddress: userAddress,
        nonce: currentNonce,
      };

      // Sign the typed data
      const signature = await signer.signTypedData(domain, types, message);
      console.log("signature", signature);
      setSignature(signature);
      notification.success("Signature generated successfully");
    } catch (error) {
      console.error(error);
      notification.error("Failed to generate signature");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={generateSignature} disabled={isLoading || isNonceLoading} className="btn btn-primary">
        {isLoading ? "Generating..." : "Generate EIP-712 Signature"}
      </button>
      {signature && <p>Signature: {signature}</p>}
    </div>
  );
}

export default InitializeHackerProfile;
