"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export type BreadcrumbItem = {
  label: string;
  path: string;
};

type BreadcrumbNavProps = {
  breadcrumbs: BreadcrumbItem[];
  className?: string;
};

export function BreadcrumbNav({ breadcrumbs, className }: BreadcrumbNavProps) {
  const router = useRouter();

  const handleNavigate = (path?: string) => {
    if (path) {
      router.push(path);
      return;
    }
    router.back();
  };

  return (
    <div className={className ?? "flex items-center gap-2 text-sm text-gray-500"}>
      <button onClick={() => handleNavigate()} className="text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" />
      </button>
      {breadcrumbs.map((crumb, index) => (
        <span
          key={`${crumb.path}-${index}`}
          className={index === breadcrumbs.length - 1 ? "text-[#242833]" : ""}
        >
          {index > 0 && <span className="mr-2 text-gray-400">/</span>}
          {index === breadcrumbs.length - 1 ? (
            crumb.label
          ) : (
            <button onClick={() => handleNavigate(crumb.path)} className="hover:text-gray-800">
              {crumb.label}
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

function normalizeSegment(segment: string): string {
  return segment.replace(/[-_]/g, " ");
}

export function getRouteBreadcrumb(pathname: string): BreadcrumbItem[] {
  const rawSegments = pathname.split("/").filter(Boolean);
  if (rawSegments.length === 0) return [{ label: "home", path: "/" }];

  return rawSegments.map((segment, index) => ({
    label: normalizeSegment(decodeURIComponent(segment)),
    path: `/${rawSegments.slice(0, index + 1).join("/")}`,
  }));
}

export function getRouteBackPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return "/";

  const candidateSegmentIndex = segments.lastIndexOf("candidates");
  if (candidateSegmentIndex > 0) {
    return `/${segments.slice(0, candidateSegmentIndex).join("/")}`;
  }

  return `/${segments.slice(0, -1).join("/")}`;
}
