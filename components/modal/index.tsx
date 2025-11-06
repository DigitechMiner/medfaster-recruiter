"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/custom/heading";
import { ResponsiveParagraph } from "@/components/custom/paragraph";
import { CheckCircle2, Info } from "lucide-react";

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

interface SuccessModalProps extends BaseModalProps {
  variant?: "success";
  buttonText?: string;
  onConfirm?: never;
  onCancel?: never;
  primaryButtonText?: never;
  secondaryButtonText?: never;
}

interface ConfirmationModalProps extends BaseModalProps {
  variant: "confirmation";
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  buttonText?: never;
}

type ModalProps = SuccessModalProps | ConfirmationModalProps;

const Modal: React.FC<ModalProps> = (props) => {
  const { visible, onClose, title, message, variant = "success" } = props;

  const isConfirmation = variant === "confirmation";
  const defaultTitle = isConfirmation ? undefined : "Success";

  // Icon configuration based on variant
  const IconComponent = isConfirmation ? Info : CheckCircle2;
  const iconConfig = isConfirmation
    ? {
        outerBg: "bg-[#F04438]/10",
        middleBg: "bg-[#F04438]/20",
        innerBg: "bg-[#F04438]",
        iconColor: "text-white",
        iconSize: 24,
      }
    : {
        outerBg: "bg-[#DCFAE6]/30",
        innerBg: "bg-[#DCFAE6]/60",
        iconColor: "text-green-600",
        iconSize: 40,
      };

  // Default button texts
  const primaryButtonText = isConfirmation
    ? (props as ConfirmationModalProps).primaryButtonText || "Yes"
    : (props as SuccessModalProps).buttonText || "Done";
  const secondaryButtonText = isConfirmation
    ? (props as ConfirmationModalProps).secondaryButtonText || "No"
    : undefined;

  // Button handlers
  const handlePrimaryClick = () => {
    if (isConfirmation) {
      (props as ConfirmationModalProps).onConfirm?.() ?? onClose();
    } else {
      onClose();
    }
  };

  const handleSecondaryClick = () => {
    if (isConfirmation) {
      (props as ConfirmationModalProps).onCancel?.() ?? onClose();
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[90vw] max-w-[400px] [&>button]:hidden rounded-xl p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col items-center p-4 pt-8">
          {/* Icon with Layered Effect */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            {isConfirmation ? (
              // 3 Layers for Confirmation
              <>
                {/* Outer Layer */}
                <div className={`rounded-full ${iconConfig.outerBg} p-3`}>
                  {/* Middle Layer */}
                  <div className={`rounded-full ${iconConfig.middleBg} p-3`}>
                    {/* Inner Layer */}
                    <div className={`rounded-full ${iconConfig.innerBg} p-2`}>
                      <IconComponent
                        width={iconConfig.iconSize}
                        height={iconConfig.iconSize}
                        className={iconConfig.iconColor}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // 2 Layers for Success
              <>
                {/* Outer Layer */}
                <div className={`rounded-full ${iconConfig.outerBg} p-3`}>
                  {/* Inner Layer */}
                  <div className={`rounded-full ${iconConfig.innerBg} p-3`}>
                    <IconComponent
                      width={iconConfig.iconSize}
                      height={iconConfig.iconSize}
                      className={iconConfig.iconColor}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <Heading size="xs" className="text-center mb-2">
            {title || defaultTitle}
          </Heading>

          {/* Optional Message */}
          {message && (
            <ResponsiveParagraph
              size="sm"
              className="text-center text-gray-600 mb-4 sm:mb-6"
            >
              {message}
            </ResponsiveParagraph>
          )}

          {/* Action Buttons */}
          <div className="w-full mt-2 sm:mt-4">
            {isConfirmation ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleSecondaryClick}
                  variant="ghost"
                  className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium py-5 sm:py-6 rounded-lg text-sm sm:text-base"
                >
                  {secondaryButtonText}
                </Button>
                <Button
                  onClick={handlePrimaryClick}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-5 sm:py-6 rounded-lg text-sm sm:text-base"
                >
                  {primaryButtonText}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handlePrimaryClick}
                className="w-full bg-[#F4781B] hover:bg-orange-600 text-white font-medium py-5 sm:py-6 rounded-lg text-sm sm:text-base"
              >
                {primaryButtonText}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Export with backward compatibility
export default Modal;
export { Modal as SuccessModal };
