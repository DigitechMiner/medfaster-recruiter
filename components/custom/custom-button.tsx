import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rightIcon?: LucideIcon;
  iconClassName?: string;
  iconContainerClassName?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    button: "px-3 py-1",
    buttonWithIcon: "px-3 py-1 pr-1",
    text: "text-sm",
    gap: "gap-2",
  },
  md: {
    button: "px-4 py-1.5",
    buttonWithIcon: "px-4 py-1.5 pr-1",
    text: "text-base",
    gap: "gap-2.5",
  },
  lg: {
    button: "px-6 py-2",
    buttonWithIcon: "px-6 py-2 pr-1",
    text: "text-lg",
    gap: "gap-3",
  },
};

const iconSizeClasses = {
  sm: {
    container: "p-1.5",
    icon: "w-3 h-3",
  },
  md: {
    container: "p-2",
    icon: "w-4 h-4",
  },
  lg: {
    container: "p-2.5",
    icon: "w-5 h-5",
  },
};

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, rightIcon: RightIcon, iconClassName, iconContainerClassName, size = "md", children, ...props }, ref) => {
    const sizeConfig = sizeClasses[size];
    const iconConfig = iconSizeClasses[size];
    
    const buttonPaddingClass = RightIcon ? sizeConfig.buttonWithIcon : sizeConfig.button;

    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center relative overflow-hidden w-fit my-2 rounded-full",
          "bg-[#F4781B] text-white font-normal shadow hover:opacity-90 transition-colors",
          "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          buttonPaddingClass,
          sizeConfig.text,
          sizeConfig.gap,
          className
        )}
        {...props}
      >
        <span>{children}</span>

        {RightIcon && (
          <div className={cn("bg-white rounded-full border border-current/20 flex items-center justify-center", iconConfig.container, iconContainerClassName)}>
            <RightIcon className={cn("text-black", iconConfig.icon, iconClassName)} />
          </div>
        )}
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";

export { CustomButton };


