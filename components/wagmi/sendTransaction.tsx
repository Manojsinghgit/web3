import { FormEvent, useState, useEffect } from "react";
import { useWaitForTransactionReceipt, BaseError } from "wagmi";
import { useWeb3Auth } from "@web3auth/modal/react";
import { BrowserProvider, Contract, parseUnits, getAddress } from "ethers";
import { useAccount } from "wagmi";
import { USDC_POLYGON, ERC20_ABI, normalizeAddress, TOKEN_CONFIG } from "./config";
import toast from "react-hot-toast";

export function SendTransaction() {
  const { provider: web3AuthProvider } = useWeb3Auth();
  const { address } = useAccount();
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!web3AuthProvider || !address) {
      setError(new Error("Not connected"));
      toast.error("Not connected");
      return;
    }

    setIsPending(true);
    setError(null);
    setHash(null);
    toast.loading("Processing payment", { id: "payment" });

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const recipientAddress = formData.get('address') as string;
      const amount = formData.get('value') as string;

      // Normalize recipient address
      const normalizedRecipient = normalizeAddress(recipientAddress);

      // Get provider and signer
      const provider = new BrowserProvider(web3AuthProvider as any);
      const signer = await provider.getSigner();

      // Normalize USDC contract address
      const normalizedUsdcAddress = normalizeAddress(USDC_POLYGON);
      const usdcContract = new Contract(normalizedUsdcAddress, ERC20_ABI, signer);

      // Convert USD amount to USDC (6 decimals)
      const amountInUnits = parseUnits(amount, TOKEN_CONFIG.decimals);

      // Execute transfer
      const tx = await usdcContract.transfer(normalizedRecipient, amountInUnits);
      setHash(tx.hash);

      // Wait for transaction
      await tx.wait();
      
      toast.success("Payment sent", { id: "payment" });
    } catch (err: any) {
      setError(err);
      toast.error("Payment failed", { id: "payment" });
    } finally {
      setIsPending(false);
    }
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: hash as `0x${string}` | undefined,
    })

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Send Payment</h2>
      </div>
      
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Recipient ID
          </label>
          <input
            name="address"
            placeholder="Enter recipient ID"
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
          />
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Amount (USD)
          </label>
          <input
            name="value"
            placeholder="Enter amount in USD"
            type="number"
            step="0.01"
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
          />
        </div>
        
        <button
          disabled={isPending || isConfirming}
          type="submit"
          className="w-full rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#111827' }}
        >
          {isPending ? 'Processing...' : isConfirming ? 'Confirming payment...' : 'Send Payment'}
        </button>
      </form>
      
      {hash && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-xs font-medium text-green-700">Payment Reference:</p>
          <p className="mt-1 break-all font-mono text-xs text-green-600">{hash}</p>
        </div>
      )}
      
      {isConfirmed && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Payment sent successfully.
        </div>
      )}
      
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Error: {(error as BaseError).shortMessage || error.message}
        </div>
      )}
    </div>
  )
}
