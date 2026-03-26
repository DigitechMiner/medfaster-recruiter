interface Transaction {
  id: string;
  type?: string;
  description?: string;
  amount: number | string;
  created_at: string;
  reference?: string;
}

export default function TransactionItem({ transaction: tx }: { transaction: Transaction }) {
  const amount = Number(tx.amount) / 100; // cents → CAD
  const isDebit = amount < 0;

  const formatted = new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  const date = new Date(tx.created_at).toLocaleDateString('en-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const label = tx.type
    ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1).toLowerCase().replace(/_/g, ' ')
    : 'Transaction';

  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex items-start justify-between shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {tx.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{tx.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{date}</p>
      </div>
      <p className={`text-sm font-semibold ml-4 shrink-0 ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
        CA$ {formatted}/-
      </p>
    </div>
  );
}
