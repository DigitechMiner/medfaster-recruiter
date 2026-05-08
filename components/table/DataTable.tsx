"use client";

import type { ReactNode } from "react";

type DataTableProps = {
  headers: string[];
  children: ReactNode;
  minWidthClassName?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  wrapperClassName?: string;
};

export function DataTable({
  headers,
  children,
  minWidthClassName = "min-w-[700px]",
  tableClassName = "",
  headerRowClassName = "bg-orange-50/70 border-b border-orange-100",
  wrapperClassName = "overflow-x-auto",
}: DataTableProps) {
  return (
    <div className={wrapperClassName}>
      <table className={`w-full text-sm ${minWidthClassName} ${tableClassName}`.trim()}>
        <thead>
          <tr className={headerRowClassName}>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
