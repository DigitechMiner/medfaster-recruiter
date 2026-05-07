import Image from 'next/image';

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

export { default as OtpVerificationForm } from './OtpVerificationForm';
export { default as SignInForm } from './SignInForm';
