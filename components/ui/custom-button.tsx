import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rightIcon?: LucideIcon;
  iconClassName?: string;
  iconContainerClassName?: string;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, rightIcon: RightIcon, iconClassName, iconContainerClassName, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Default reusable design (matches your provided example)
          "pl-6 pr-1 py-1 flex items-center gap-3 relative overflow-hidden w-fit my-2",
          "bg-[#F4781B] text-white text-base font-normal rounded-full shadow hover:opacity-90 transition-colors",
          "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span>{children}</span>

        {RightIcon && (
          <div className={cn("p-2 bg-white rounded-full border border-current/20 flex items-center justify-center", iconContainerClassName)}>
            <RightIcon className={cn("w-4 h-4 text-black", iconClassName)} />
          </div>
        )}
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";

export { CustomButton };
