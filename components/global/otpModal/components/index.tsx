import Image from 'next/image';
import { X } from 'lucide-react';

interface CloseButtonProps {
  className?: string;
  onClose: () => void;
}

export const CloseButton = ({ className, onClose }: CloseButtonProps) => (
  <button
    onClick={onClose}
    className={className}
    aria-label="Close modal"
  >
    <X size={20} />
  </button>
);

export const Logo = () => (
  <div className="mb-6 flex justify-center">
    <Image
      src="/img/brand/new_logo.svg"
      alt="KeRaeva"
      width={150}
      height={40}
    />
  </div>
);
