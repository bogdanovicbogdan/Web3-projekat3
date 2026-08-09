"use client";

import { useState, useCallback, useEffect } from "react";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { CONTRACT_ADDRESSES, NETWORK, VAULT_ABI, USDC_ABI } from "./contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [error, setError] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Provera da li je MetaMask vec povezan (ne trazi ponovnu dozvolu ako jeste)
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        connect();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchToLocalNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainIdHex }],
      });
    } catch (switchError: any) {
      // Mreza jos nije dodata u MetaMask - dodajemo je automatski
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: NETWORK.chainIdHex,
              chainName: NETWORK.chainName,
              rpcUrls: [NETWORK.rpcUrl],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask nije pronadjen. Instaliraj ekstenziju prvo.");
      return;
    }
    setIsConnecting(true);
    setError("");
    try {
      await switchToLocalNetwork();
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      const newSigner = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(newSigner);
      setAddress(accounts[0]);
    } catch (e: any) {
      setError(e?.message || "Konekcija nije uspela");
    } finally {
      setIsConnecting(false);
    }
  }, [switchToLocalNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
  }, []);

  // Ugovori spremni za koriscenje cim je signer dostupan
  const getVaultContract = useCallback(() => {
    if (!signer) return null;
    return new Contract(CONTRACT_ADDRESSES.vault, VAULT_ABI, signer);
  }, [signer]);

  const getUsdcContract = useCallback(() => {
    if (!signer) return null;
    return new Contract(CONTRACT_ADDRESSES.usdc, USDC_ABI, signer);
  }, [signer]);

  return {
    address,
    provider,
    signer,
    error,
    isConnecting,
    connect,
    disconnect,
    getVaultContract,
    getUsdcContract,
  };
}
