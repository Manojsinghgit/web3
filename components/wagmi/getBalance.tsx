import { useWeb3Auth } from "@web3auth/modal/react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { USDC_POLYGON, ERC20_ABI, normalizeAddress, POLYGON_CHAIN_ID } from "./config";

export function Balance() {
  const { address } = useAccount();
  const { provider: web3AuthProvider } = useWeb3Auth();
  const [usdBalance, setUsdBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      if (!web3AuthProvider || !address) return;
      setIsLoading(true);
      setError(null);
      try {
        const provider = new BrowserProvider(web3AuthProvider as any);
        const network = await provider.getNetwork();
        const activeChainId = Number(network.chainId);

        // Only fetch Polygon USDC balance
        if (activeChainId === POLYGON_CHAIN_ID) {
          // Normalize address to fix checksum
          const normalizedAddress = normalizeAddress(USDC_POLYGON);
          const usdcContract = new Contract(normalizedAddress, ERC20_ABI, provider);
          
          const raw = await usdcContract.balanceOf(address);
          const decimals = await usdcContract.decimals();
          setUsdBalance(formatUnits(raw, decimals));
        } else {
          // If not on Polygon, show 0.00
          setUsdBalance("0.00");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to fetch balance.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBalance();
  }, [web3AuthProvider, address]);

  // USD value (1:1 for USDC)
  const usdBalanceValue = parseFloat(usdBalance).toFixed(2);

  return (
    <div className="rounded-[18px] bg-white p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Available Balance</h2>
      
      {isLoading && (
        <div className="py-8 text-center text-sm text-gray-600">Loading...</div>
      )}
      
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Error: {error}
        </div>
      )}

      {!isLoading && !error && (
        <div>
          <p className="text-4xl font-bold mb-2 text-gray-900">${usdBalanceValue}</p>
          <p className="text-base font-medium text-gray-600">USD</p>
        </div>
      )}
    </div>
  )
}
