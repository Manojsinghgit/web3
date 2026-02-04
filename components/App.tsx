"use client";

import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser, useWalletUI, useWeb3Auth } from "@web3auth/modal/react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { SendTransaction } from "./wagmi/sendTransaction";
import { Balance } from "./wagmi/getBalance";
import { POLYGON_CHAIN_ID, USDC_POLYGON } from "./wagmi/config";
import { useEffect } from "react";
import toast from "react-hot-toast";

function App() {
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  // IMP START - Logout
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { showWalletUI, loading: walletUiLoading, error: walletUiError } = useWalletUI();
  const { provider: web3AuthProvider } = useWeb3Auth();
  const { address, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const truncateAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Show centered welcome toast on login
  useEffect(() => {
    if (isConnected) {
      toast(
        (t) => (
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">Welcome to TopupGo</p>
            <p className="text-sm mt-1 text-gray-600">Your account is ready</p>
          </div>
        ),
        {
          duration: 2500,
          position: 'top-center',
          style: {
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '18px',
            padding: '20px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        }
      );
    }
  }, [isConnected]);

  /**
   * Opens MetaMask Embedded Wallet's checkout modal for buying crypto
   * Uses showCheckout() method with USD as default currency via fiatList order
   * 
   * How USD becomes default:
   * - The first currency in fiatList array is automatically selected as default
   * - By placing 'USD' first, it becomes the default selection
   * - INR is included as second option, making it available in dropdown
   * - This approach works regardless of user's location (India or elsewhere)
   */
  const openBuyCrypto = async () => {
    try {
      if (!web3AuthProvider) {
        toast.error("Wallet not connected");
        return;
      }

      toast.loading("Preparing secure checkout", { id: "buy-crypto" });

      // Auto-switch to Polygon if not already on it (hidden from user)
      if (chainId !== POLYGON_CHAIN_ID) {
        await switchChain({ chainId: POLYGON_CHAIN_ID });
        // Wait for chain switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Access MetaMask Embedded Wallet SDK from Web3Auth provider
      // Web3Auth wraps MetaMask Embedded Wallet, access it through provider's internal structure
      const provider = web3AuthProvider as any;
      
      // Try multiple paths to access the embedded wallet SDK instance
      // Web3Auth Modal SDK structure may vary, so we check multiple possible locations
      const embeddedWalletSDK = 
        provider?.embeddedWalletAdapter?.sdk ||           // Direct adapter access
        provider?.adapter?.sdk ||                          // Alternative adapter path
        provider?.sdk ||                                    // Direct SDK access
        provider?.provider?.embeddedWalletAdapter?.sdk ||  // Nested provider access
        provider?.provider?.sdk;                            // Nested SDK access

      // Check if showCheckout method is available on the SDK instance
      if (embeddedWalletSDK && typeof embeddedWalletSDK.showCheckout === 'function') {
        // Use showCheckout() with fiatList to control default currency
        // The order in fiatList determines which currency appears as default
        // USD is first = automatically selected as default
        // INR is second = available in dropdown for user selection
        await embeddedWalletSDK.showCheckout({
          chainId: `eip155:${POLYGON_CHAIN_ID}`, // Polygon chain ID in CAIP-2 format (eip155:137)
          tokenAddress: USDC_POLYGON, // Polygon USDC contract address (0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174)
          // fiatList order controls default: first item = default, rest = dropdown options
          fiatList: ['USD', 'INR'], // USD appears as default, INR available in dropdown
        });

        toast.dismiss("buy-crypto");
        toast.success("Checkout opened successfully");
      } else {
        // Fallback to showWalletUI if showCheckout is not available
        // This ensures the feature works even if SDK structure differs
        console.warn("showCheckout method not found, using showWalletUI fallback");
        showWalletUI({ 
          show: true, 
          path: "wallet/funding",
        });
        toast.dismiss("buy-crypto");
      }
    } catch (err: any) {
      console.error("Error opening checkout:", err);
      toast.dismiss("buy-crypto");
      toast.error("Failed to open checkout. Please try again.");
      
      // Fallback: try opening wallet UI as last resort
      try {
        showWalletUI({ show: true, path: "wallet/funding" });
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
      }
    }
  };

  // Keep handleTopUp for backward compatibility, but use openBuyCrypto internally
  const handleTopUp = openBuyCrypto;

  const loggedInView = (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="w-full border-b" style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: '#111827' }}>
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold" style={{ color: '#111827' }}>TopupGo</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 border" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium" style={{ color: '#059669' }}>Connected</span>
              </div>
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
                style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#111827', backgroundColor: 'rgba(255,255,255,0.8)' }}
                disabled={disconnectLoading}
              >
                {disconnectLoading ? "Disconnecting..." : "Log Out"}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
              {disconnectError && <div className="text-sm text-red-600">{disconnectError.message}</div>}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content - 2x2 Grid */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* TOP ROW */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          {/* Left: Available Balance */}
          <Balance />
          
          {/* Right: Top Up */}
          <div className="rounded-[18px] bg-white p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Top Up</h2>
            </div>
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <p className="mb-6 text-center text-sm text-gray-600">
              Add funds to your TopupGo account
            </p>
            <button
              onClick={handleTopUp}
              className="w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#111827' }}
              disabled={walletUiLoading}
            >
              {walletUiLoading ? "Opening..." : "Top Up USD"}
            </button>
            {walletUiError && <div className="mt-2 text-sm text-red-600">{walletUiError.message}</div>}
          </div>
        </div>

        {/* SECOND ROW */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Send Payment */}
          <div className="rounded-[18px] bg-white p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <SendTransaction />
          </div>
          
          {/* Right: Profile */}
          <div className="rounded-[18px] bg-white p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            </div>
            <div className="mb-4 flex justify-center">
              {userInfo?.profileImage ? (
                <img
                  src={userInfo.profileImage}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="mb-2 text-center">
              <p className="text-base font-semibold text-gray-900">
                {userInfo?.name || "User"}
              </p>
            </div>
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">
                {userInfo?.email || "user@example.com"}
              </p>
            </div>
            {/* <button
              onClick={() => uiConsole(userInfo)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              View Profile
            </button> */}
          </div>
        </div>
      </div>

      <div id="console" className="hidden">
        <p></p>
      </div>
    </div>
  );

  const unloggedInView = (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-[18px] bg-white p-8 w-full max-w-md" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg" style={{ backgroundColor: '#111827' }}>
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">TopupGo</h1>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>
        <button
          onClick={() => connect()}
          className="w-full rounded-lg px-6 py-3 text-base font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#111827' }}
          disabled={connectLoading}
        >
          {connectLoading ? "Connecting..." : "Sign In"}
        </button>
        {connectError && <div className="mt-4 text-center text-sm text-red-600">{connectError.message}</div>}
      </div>
    </div>
  );

  if (!isConnected) {
    return unloggedInView;
  }

  return loggedInView;
}

export default App;
