"use client";

import React from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  iconSrc?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title = "Success",
  message,
  buttonText = "Done",
  iconSrc = "/svg/success-icon.svg",
}) => {
  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[90vw] max-w-[400px] [&>button]:hidden rounded-xl">
        <div className="flex flex-col items-center py-4 sm:py-6 px-2 sm:px-4">
          {/* Success Icon - Responsive Size */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
           <Image
              src={iconSrc}
              alt="Success"
              width={100}
              height={100}
              className="w-46 h-46 sm:w-24 sm:h-24 object-contain"
              priority
            />
          </div>

          {/* Success Message */}
          <h2 className="text-lg sm:text-xl font-semibold text-center mb-2 px-2">
          {title}
          </h2>

          {/* Optional Message */}
          {message && (
            <p className="text-sm sm:text-base text-center text-gray-600 mb-4 sm:mb-6 px-2">
             {message}
            </p>
          )}

          {/* Action Button */}
          <div className="w-full mt-2 sm:mt-4">
            <Button
              onClick={onClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-5 sm:py-6 rounded-lg text-sm sm:text-base"
           >
              {buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
