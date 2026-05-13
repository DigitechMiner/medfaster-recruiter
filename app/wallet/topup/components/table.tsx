import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import type { WalletTopup } from "@/features/wallet";
import { PER_PAGE_OPTIONS, SkeletonRow, StatusBadge } from "../../helpers";

const TOPUP_HEADERS = [
  "Top-up ID",
  "Top-up Amount",
  "Stripe Fees",
  "Received in Wallet",
  "Currency",
  "Status",
  "Created At",
];

type TopupTableProps = {
  topups: WalletTopup[];
  totalTopups: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

const formatTopupId = (id?: string) => {
  if (!id) return "-";
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
};

const formatCents = (value?: number | string | null) => {
  if (value == null) return "-";

  const cents = Number(value);
  if (Number.isNaN(cents)) return "-";

  const amountInDollars = cents / 100;

  return `$ ${amountInDollars.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatTopupAmount = (topup: WalletTopup) =>
  formatCents(topup.amount_cents ?? topup.amount);

const formatTopupDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-CA");
};

export function TopupTable({
  topups,
  totalTopups,
  isLoading,
  error,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
}: TopupTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-900">
          Wallet Top-up History
        </h2>
        <p className="text-[13px] text-gray-400 mt-0.5">
          Review your recent wallet recharge attempts and payments.
        </p>
      </div>

      {error ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-semibold text-gray-800">
            Failed to load top-up history
          </p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      ) : (
        <>
          <DataTable headers={TOPUP_HEADERS} minWidthClassName="min-w-[980px]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} cols={7} />
              ))
            ) : topups.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-16 text-center text-gray-400 text-sm"
                >
                  No top-ups found
                </td>
              </tr>
            ) : (
              topups.map((topup) => (
                <tr
                  key={topup.id}
                  className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-mono text-[13px] italic text-gray-700">
                      {formatTopupId(topup.id)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">
                    {formatTopupAmount(topup)}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-gray-700 whitespace-nowrap">
                    {formatCents(topup.metadata?.stripe?.fee)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-green-600 whitespace-nowrap">
                    {formatCents(topup.metadata?.stripe?.net)}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-gray-700 uppercase whitespace-nowrap">
                    {topup.currency ?? "CAD"}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={topup.status} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[13px] text-gray-700">
                    {formatTopupDate(topup.created_at)}
                  </td>
                </tr>
              ))
            )}
          </DataTable>

          <PaginationFooter
            page={page}
            totalItems={totalTopups}
            perPage={perPage}
            onPageChange={onPageChange}
            itemLabel="top-ups"
            perPageOptions={PER_PAGE_OPTIONS}
            onPerPageChange={onPerPageChange}
          />
        </>
      )}
    </div>
  );
}
