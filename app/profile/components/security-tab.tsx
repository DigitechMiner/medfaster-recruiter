"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import { FormInput } from "@/components/forms";
import { OtpVerificationModal } from "@/components/modal/otpVerificationModal";
import { Button } from "@/components/ui/button";
import {
  getRecruiterCredential,
  sendVerifyCredentialOtp,
  updateRecruiterCredential,
  validateVerifyCredentialOtp,
} from "@/features/profile";
import { useAuthStore } from "@/stores/authStore";
import {
  buildVerifyCredentialPhonePayload,
  DEFAULT_PHONE_DIAL_CODE,
  emptyOtpDigits,
  isOptionalCredentialEmail,
  isOptionalCredentialPhone,
  isRecruiterLoginPhoneE164,
  isValidEmail,
  OTP_LENGTH,
} from "@/utils/auth";

import { VerificationBadge } from "@/components/custom/verification-badge";

const credentialSchema = z.object({
  email: z
    .string()
    .trim()
    .refine(isOptionalCredentialEmail, {
      message: "Invalid email address",
    }),
  phone: z
    .string()
    .trim()
    .refine(isOptionalCredentialPhone, {
      message: "Use E.164 format (e.g. +14165550123)",
    }),
});

type CredentialFormValues = z.infer<typeof credentialSchema>;

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

type LoadState = "loading" | "ready" | "error";

type VerifyChannel = "email" | "phone";

export function ProfileSecurityTab() {
  const loadRecruiterProfile = useAuthStore((s) => s.loadRecruiterProfile);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [verified, setVerified] = useState<{
    email: boolean;
    phone: boolean;
  } | null>(null);

  const [verifyChannel, setVerifyChannel] = useState<VerifyChannel | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(emptyOtpDigits);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifySending, setVerifySending] = useState(false);
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  const methods = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: { email: "", phone: "" },
  });

  const emailValue = methods.watch("email");
  const phoneValue = methods.watch("phone");
  const emailDirty = !!methods.formState.dirtyFields.email;
  const phoneDirty = !!methods.formState.dirtyFields.phone;

  const emailLooksValid = !!emailValue?.trim() && isValidEmail(emailValue);
  const phoneLooksValid = !!phoneValue?.trim() && isRecruiterLoginPhoneE164(phoneValue);

  const fetchCredentials = async () => {
    setLoadState("loading");
    try {
      const res = await getRecruiterCredential();
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load credentials");
      }
      setVerified({
        email: res.data.email_verified,
        phone: res.data.phone_verified,
      });
      methods.reset({
        email: res.data.email ?? "",
        phone: res.data.phone ?? "",
      });
      setLoadState("ready");
    } catch (e) {
      setLoadState("error");
      toast.error(getApiErrorMessage(e, "Failed to load sign-in credentials"));
    }
  };

  /** Refresh credential state without toggling the full-panel loading UI (e.g. after OTP verify). */
  const refreshCredentialsQuiet = async () => {
    try {
      const res = await getRecruiterCredential();
      if (!res.success || !res.data) return;
      setVerified({
        email: res.data.email_verified,
        phone: res.data.phone_verified,
      });
      methods.reset({
        email: res.data.email ?? "",
        phone: res.data.phone ?? "",
      });
    } catch {
      // ignore — user already saw success toast
    }
  };

  useEffect(() => {
    void fetchCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only load
  }, []);

  const closeVerifyDialog = () => {
    setVerifyChannel(null);
    setOtpDigits(emptyOtpDigits());
    setOtpError(null);
    setVerifySending(false);
    setVerifySubmitting(false);
  };

  const openVerifyDialog = async (channel: VerifyChannel) => {
    setVerifyChannel(channel);
    setOtpDigits(emptyOtpDigits());
    setOtpError(null);
    setVerifySending(true);
    try {
      if (channel === "email") {
        const email = emailValue.trim();
        const res = await sendVerifyCredentialOtp({ email });
        if (!res.success) {
          toast.error(res.message || "Could not send verification code");
          closeVerifyDialog();
          return;
        }
        toast.success(res.message || "Verification code sent");
      } else {
        const payload = buildVerifyCredentialPhonePayload(phoneValue.trim());
        const res = await sendVerifyCredentialOtp(payload);
        if (!res.success) {
          toast.error(res.message || "Could not send verification code");
          closeVerifyDialog();
          return;
        }
        toast.success(res.message || "Verification code sent");
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not send verification code"));
      closeVerifyDialog();
    } finally {
      setVerifySending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    setOtpError(null);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleOtpKeyDown = () => {};

  const handleCredentialVerifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!verifyChannel) return;
    setOtpError(null);

    const code = otpDigits.join("");
    if (code.length !== OTP_LENGTH) {
      setOtpError(`Please enter a ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setVerifySubmitting(true);
    try {
      if (verifyChannel === "email") {
        const res = await validateVerifyCredentialOtp({
          otp: code,
          email: emailValue.trim(),
        });
        if (!res.success) {
          setOtpError(res.message || "Verification failed");
          setOtpDigits(emptyOtpDigits());
          return;
        }
        toast.success(res.message || "Email verified");
      } else {
        const payload = buildVerifyCredentialPhonePayload(phoneValue.trim());
        const res = await validateVerifyCredentialOtp({
          otp: code,
          phone: payload.phone,
          country_code: payload.country_code,
        });
        if (!res.success) {
          setOtpError(res.message || "Verification failed");
          setOtpDigits(emptyOtpDigits());
          return;
        }
        toast.success(res.message || "Phone verified");
      }
      await refreshCredentialsQuiet();
      closeVerifyDialog();
    } catch (e) {
      setOtpError(getApiErrorMessage(e, "Verification failed"));
      setOtpDigits(emptyOtpDigits());
    } finally {
      setVerifySubmitting(false);
    }
  };

  const onSubmit = async (data: CredentialFormValues) => {
    const dirty = methods.formState.dirtyFields;
    const payload: { email?: string | null; phone?: string | null } = {};

    if (dirty.email) {
      payload.email = data.email.trim() || null;
    }
    if (dirty.phone) {
      const p = data.phone.trim();
      if (!p) {
        toast.error("Phone cannot be empty. Enter a valid E.164 number.");
        return;
      }
      payload.phone = p;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    try {
      const res = await updateRecruiterCredential(payload);
      if (!res.success || !res.data) {
        toast.error(res.message || "Update failed");
        return;
      }
      toast.success(res.message || "Credentials updated");
      setVerified({
        email: res.data.email_verified,
        phone: res.data.phone_verified,
      });
      methods.reset({
        email: res.data.email ?? "",
        phone: res.data.phone ?? "",
      });
      await loadRecruiterProfile();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to update credentials"));
    }
  };

  if (loadState === "loading") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[280px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#f47b20]" aria-hidden />
        <p className="text-sm text-gray-500 mt-4">Loading sign-in credentials…</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-600 mb-4">Could not load sign-in credentials.</p>
        <Button
          type="button"
          variant="ghost"
          className="rounded-md border border-[#f47b20] text-[#f47b20] hover:bg-orange-50"
          onClick={() => void fetchCredentials()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const showVerifyEmail =
    verified?.email === false && !emailDirty && emailLooksValid && !methods.formState.isSubmitting;
  const showVerifyPhone =
    verified?.phone === false && !phoneDirty && phoneLooksValid && !methods.formState.isSubmitting;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-1">Sign-in & verification</h2>
        <p className="text-sm text-gray-500 mb-6">
          These are your login email and mobile number (E.164). Updating a value resets its verification until you
          confirm it again with a code.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="email"
              label="Login email"
              type="email"
              placeholder="you@example.com"
              labelEnd={
                showVerifyEmail ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-md border border-[#f47b20] text-[#f47b20] hover:bg-orange-50 text-xs font-medium"
                    disabled={verifySending || !!verifyChannel}
                    onClick={() => void openVerifyDialog("email")}
                  >
                    Verify
                  </Button>
                ) : undefined
              }
              inputEnd={<VerificationBadge verified={verified?.email} />}
            />
            <FormInput
              name="phone"
              label="Login phone (E.164)"
              type="tel"
              placeholder="+14165550123"
              labelEnd={
                showVerifyPhone ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-md border border-[#f47b20] text-[#f47b20] hover:bg-orange-50 text-xs font-medium"
                    disabled={verifySending || !!verifyChannel}
                    onClick={() => void openVerifyDialog("phone")}
                  >
                    Verify
                  </Button>
                ) : undefined
              }
              inputEnd={<VerificationBadge verified={verified?.phone} />}
            />
          </div>

          {(emailDirty || phoneDirty) && (verified?.email === false || verified?.phone === false) ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Save your changes before verifying, so the code matches the email or phone on your account.
            </p>
          ) : null}

          <div className="flex justify-end border-t border-gray-100 pt-6">
            <Button
              type="submit"
              disabled={!methods.formState.isDirty || methods.formState.isSubmitting}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                methods.formState.isDirty
                  ? "bg-[#f47b20] text-white hover:bg-[#d5650e]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {methods.formState.isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>

          <p className="text-xs text-gray-400">
            OTP sign-in uses these identifiers. Clearing email sends an empty value to the server when you save (if
            allowed by your account policy).
          </p>
        </div>
      </form>

      <OtpVerificationModal
        open={verifyChannel !== null}
        onOpenChange={(open) => {
          if (!open) closeVerifyDialog();
        }}
        isSendingOtp={verifySending}
        formKey={verifyChannel ?? undefined}
        showCloseButton={!verifySending && !verifySubmitting}
        contactValue={
          verifyChannel === "email"
            ? emailValue.trim()
            : verifyChannel === "phone"
              ? phoneValue.trim()
              : ""
        }
        countryCode={verifyChannel === "phone" ? "" : DEFAULT_PHONE_DIAL_CODE}
        otp={otpDigits}
        otpSending={false}
        otpVerifying={verifySubmitting}
        otpError={otpError}
        onOtpChange={handleOtpChange}
        onOtpKeyDown={handleOtpKeyDown}
        onVerifyOTP={handleCredentialVerifySubmit}
        onResendOTP={() => {}}
        submitLabel="Verify"
        showResend={false}
      />
    </FormProvider>
  );
}
