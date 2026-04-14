"use client";

import React from "react";

interface ColumnShellProps {
  wrapperClassName?: string;
  containerClassName: string;
  header?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  sideContent?: React.ReactNode;
}

export function ColumnShell({
  wrapperClassName,
  containerClassName,
  header,
  content,
  footer,
  sideContent,
}: ColumnShellProps) {
  return (
    <div className={wrapperClassName}>
      <div className={containerClassName}>
        {header}
        {content}
        {footer}
      </div>
      {sideContent}
    </div>
  );
}
