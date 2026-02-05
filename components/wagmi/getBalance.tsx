import { useWeb3Auth } from "@web3auth/modal/react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { useAccount, useChainId } from "wagmi";
import { useEffect, useState } from "react";
import { USDC_POLYGON, USDC_POLYGON_NATIVE, ERC20_ABI, normalizeAddress, POLYGON_CHAIN_ID } from "./config";

const REFRESH_INTERVAL_MS = 60 * 1000; // 1 min

export function Balance({ refreshTrigger }: { refreshTrigger?: number }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { provider: web3AuthProvider } = useWeb3Auth();
  const [usdBalance, setUsdBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Har 1 min pe balance refresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchBalance(retryCount = 0) {
      if (!web3AuthProvider || !address) return;
      // Sirf pehli baar ya jab abhi tak balance nahi aaya – Loading dikhao. Refetch pe purana balance dikhte raho.
      if (!hasLoadedOnce) setIsLoading(true);
      setError(null);
      try {
        const provider = new BrowserProvider(web3AuthProvider as any);
        const activeChainId = chainId ?? Number((await provider.getNetwork()).chainId);

        if (activeChainId === POLYGON_CHAIN_ID) {
          let total = BigInt(0);
          const decimals = 6; // USDC has 6 decimals
          for (const usdcAddress of [USDC_POLYGON, USDC_POLYGON_NATIVE]) {
            const contract = new Contract(normalizeAddress(usdcAddress), ERC20_ABI, provider);
            const raw = await contract.balanceOf(address);
            total += raw;
          }
          if (!cancelled) {
            setUsdBalance(formatUnits(total, decimals));
            setHasLoadedOnce(true);
          }
        } else {
          if (!cancelled) {
            setUsdBalance("0.00");
            setHasLoadedOnce(true);
          }
        }
      } catch (err: any) {
        const msg = err?.message || "";
        const isRpcError = msg.includes("missing revert data") || msg.includes("CALL_EXCEPTION") || msg.includes("429") || msg.includes("Too Many");
        if (isRpcError && retryCount < 1) {
          await new Promise((r) => setTimeout(r, 1500));
          if (!cancelled) return fetchBalance(retryCount + 1);
        }
        if (!cancelled) {
          setUsdBalance("0.00");
          setHasLoadedOnce(true);
          setError(isRpcError ? "Balance unavailable. Try again in a moment." : (msg || "Failed to fetch balance."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchBalance();
    return () => { cancelled = true; };
  }, [web3AuthProvider, address, chainId, tick, refreshTrigger]); // hasLoadedOnce intentionally not in deps

  // USD value (1:1 for USDC)
  const usdBalanceValue = parseFloat(usdBalance).toFixed(2);

  return (
    <div className="rounded-[18px] bg-white p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Available Balance</h2>
      
      {/* Loading sirf jab abhi tak balance load nahi hua; refetch pe purana balance dikhao, 0 mat dikhao */}
      {isLoading && !hasLoadedOnce && (
        <div className="py-8 text-center text-sm text-gray-600">Loading...</div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Error: {error}
        </div>
      )}

      {(hasLoadedOnce || !isLoading) && !error && (
        <div>
          <p className="text-4xl font-bold mb-2 text-gray-900">${usdBalanceValue}</p>
          <p className="text-base font-medium text-gray-600">USD</p>
        </div>
      )}
    </div>
  )
}
