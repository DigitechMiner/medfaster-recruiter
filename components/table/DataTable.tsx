"use client";

import type { ReactNode } from "react";

type DataTableProps = {
  headers: string[];
  children: ReactNode;
  minWidthClassName?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  wrapperClassName?: string;
  columnClassNames?: string[];
};

export function DataTable({
  headers,
  children,
  minWidthClassName = "min-w-[700px]",
  tableClassName = "",
  headerRowClassName = "bg-orange-50/70 border-b border-orange-100",
  wrapperClassName = "overflow-x-auto",
  columnClassNames,
}: DataTableProps) {
  return (
    <div className={wrapperClassName}>
      <table className={`w-full text-sm ${minWidthClassName} ${tableClassName}`.trim()}>
        <thead>
          <tr className={headerRowClassName}>
            {headers.map((header, index) => (
              <th
                key={header}
                className={`px-4 py-2.5 text-left text-xs font-medium text-gray-500 whitespace-nowrap ${columnClassNames?.[index] ?? ""}`.trim()}
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
