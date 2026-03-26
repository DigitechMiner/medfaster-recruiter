interface WalletBalanceCardProps {
  balanceCAD: number;
  isLocked: boolean;
  onWithdraw: () => void;
}

export default function WalletBalanceCard({ balanceCAD, isLocked, onWithdraw }: WalletBalanceCardProps) {
  const formatted = new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(balanceCAD);

  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
      <p className="text-4xl font-bold text-gray-900 tracking-tight">
        CA$ {formatted}/-
      </p>
      {isLocked ? (
        <p className="mt-2 text-sm text-red-400">Wallet is locked</p>
      ) : (
        <button
          onClick={onWithdraw}
          className="mt-3 text-sm font-semibold text-orange-500 underline underline-offset-2"
        >
          Instant Withdraw
        </button>
      )}
    </div>
  );
}
