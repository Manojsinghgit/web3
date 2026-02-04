import { useChainId, useSwitchChain } from 'wagmi'

export function SwitchChain() {
  const chainId = useChainId()
  const { chains, switchChain, error } = useSwitchChain()

  return (
    <div className="rounded-lg border bg-white p-6" style={{ borderColor: '#E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5" style={{ color: '#0F172A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-semibold" style={{ color: '#0F172A' }}>System Status</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
        <span className="text-sm font-medium" style={{ color: '#166534' }}>Active</span>
      </div>

      {error?.message && (
        <div className="mt-4 rounded-lg border p-3 text-sm text-red-600" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
          {error.message}
        </div>
      )}
    </div>
  )
}
