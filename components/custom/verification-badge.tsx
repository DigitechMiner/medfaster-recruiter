import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function VerificationBadge({
  verified,
}: {
  verified: boolean | null | undefined;
}) {
  if (verified === true) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-transparent bg-green-50 px-2.5 text-green-700 ring-1 ring-inset ring-green-600/15 [&>svg]:size-3.5"
        )}
      >
        <CheckCircle2 aria-hidden />
        Verified
      </Badge>
    );
  }
  if (verified === false) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-transparent bg-amber-50 px-2.5 text-amber-800 ring-1 ring-inset ring-amber-600/20 [&>svg]:size-3.5"
        )}
      >
        <AlertCircle aria-hidden />
        Not verified
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent bg-gray-100 px-2.5 text-gray-600 ring-1 ring-inset ring-gray-500/15 [&>svg]:size-3.5"
      )}
    >
      <HelpCircle aria-hidden />
      Not reported
    </Badge>
  );
}
