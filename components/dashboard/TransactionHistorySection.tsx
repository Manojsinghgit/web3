"use client";

import { useMemo, useState } from "react";

type PaymentType = "Send" | "Receive" | "Topup";
type StatusType = "completed" | "pending" | "failed";

type Transaction = {
  id: string;
  username: string;
  amount: number;
  type: PaymentType;
  status: StatusType;
  actionLabel: string;
};

const TRANSACTIONS: Transaction[] = [
  { id: "tx-001", username: "Ava Johnson", amount: 125.5, type: "Send", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-002", username: "Liam Patel", amount: 48.25, type: "Receive", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-003", username: "Mia Chen", amount: 250, type: "Topup", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-004", username: "Noah Williams", amount: 72.1, type: "Send", status: "pending", actionLabel: "Pay Now" },
  { id: "tx-005", username: "Sophia Garcia", amount: 18.75, type: "Receive", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-006", username: "Ethan Kim", amount: 410, type: "Topup", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-007", username: "Isabella Brown", amount: 59.4, type: "Send", status: "failed", actionLabel: "Pay Again" },
  { id: "tx-008", username: "Oliver Smith", amount: 105.9, type: "Receive", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-009", username: "Charlotte Lee", amount: 92.35, type: "Topup", status: "pending", actionLabel: "Pay Now" },
  { id: "tx-010", username: "James Walker", amount: 64.0, type: "Send", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-011", username: "Amelia Davis", amount: 230.45, type: "Receive", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-012", username: "Benjamin Hall", amount: 12.99, type: "Send", status: "failed", actionLabel: "Pay Again" },
  { id: "tx-013", username: "Harper Allen", amount: 310.2, type: "Topup", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-014", username: "Lucas Young", amount: 88.75, type: "Receive", status: "pending", actionLabel: "Pay Now" },
  { id: "tx-015", username: "Evelyn Scott", amount: 45.0, type: "Send", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-016", username: "Henry Green", amount: 520.8, type: "Topup", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-017", username: "Abigail Adams", amount: 16.2, type: "Receive", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-018", username: "Daniel Baker", amount: 74.95, type: "Send", status: "pending", actionLabel: "Pay Now" },
  { id: "tx-019", username: "Emily Nelson", amount: 205.3, type: "Topup", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-020", username: "Michael Carter", amount: 33.6, type: "Receive", status: "failed", actionLabel: "Pay Again" },
  { id: "tx-021", username: "Scarlett Reed", amount: 115.0, type: "Send", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-022", username: "Logan Perez", amount: 62.4, type: "Topup", status: "completed", actionLabel: "Pay Again" },
  { id: "tx-023", username: "Grace Turner", amount: 19.8, type: "Receive", status: "pending", actionLabel: "Pay Now" },
  { id: "tx-024", username: "Jack Collins", amount: 140.0, type: "Send", status: "completed", actionLabel: "Pay Again" },
];

const PAGE_SIZE = 10;

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
        disabled={currentPage === 1}
      >
        Prev
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`h-7 w-7 rounded-md text-xs font-semibold transition ${
            page === currentPage
              ? "bg-gray-900 text-white"
              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isSend = transaction.type === "Send";
  const amountPrefix = isSend ? "-" : "+";
  const amountColor = isSend ? "text-rose-400" : "text-emerald-400";

  const statusStyles: Record<StatusType, string> = {
    completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    failed: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };

  return (
    <div className="grid min-w-[760px] grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr_0.8fr] items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-3 text-sm text-gray-800 transition hover:bg-gray-50">
      <div className="font-medium">{transaction.username}</div>
      <div className={`font-semibold ${amountColor}`}>
        {amountPrefix}${transaction.amount.toFixed(2)}
      </div>
      <div className="text-gray-600">{transaction.type}</div>
      <div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[transaction.status]}`}>
          {transaction.status}
        </span>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          {transaction.actionLabel}
        </button>
      </div>
    </div>
  );
}

export function TransactionHistorySection() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(TRANSACTIONS.length / PAGE_SIZE);

  const currentRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return TRANSACTIONS.slice(start, start + PAGE_SIZE);
  }, [page]);

  return (
    <div className="rounded-[18px] bg-white p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
      </div>

      <div className="rounded-2xl border border-gray-100">
        <div className="max-h-[520px] overflow-x-auto overflow-y-auto">
          <div className="sticky top-0 z-10 min-w-[760px] border-b border-gray-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <div className="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr_0.8fr] gap-4 px-5 py-3">
              <span>Username</span>
              <span>Amount</span>
              <span>Payment Type</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-3 py-4">
            {currentRows.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
