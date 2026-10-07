"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  LifeBuoy,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/global/app-layout";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { TableTabs } from "@/components/table/TableTabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createSupportTicket,
  getSupportTicket,
  listSupportTickets,
  SUPPORT_DESCRIPTION_MAX,
  SUPPORT_DESCRIPTION_MIN,
  SUPPORT_ISSUE_TYPES,
  SUPPORT_MAX_FILE_BYTES,
  SUPPORT_MAX_FILES,
  SUPPORT_TITLE_MAX,
  SUPPORT_TITLE_MIN,
  supportIssueLabel,
  supportStatusLabel,
  type SupportIssueType,
  type SupportTicket,
  type SupportTicketStatus,
} from "@/features/support";
import { formatFileSize } from "@/utils/file-validation";

const STATUS_TABS: { key: "ALL" | SupportTicketStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

const PER_PAGE_OPTIONS = [10, 20, 50];
const LIST_HEADERS = ["Ticket", "Issue", "Title", "Status", "Files", "Created", ""];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

const STATUS_COLORS: Record<SupportTicketStatus, string> = {
  OPEN: "bg-orange-100 text-orange-600",
  IN_PROGRESS: "bg-blue-100 text-blue-600",
  RESOLVED: "bg-green-100 text-green-600",
  CLOSED: "bg-gray-100 text-gray-500",
};

const fieldClassName =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white outline-none transition-colors placeholder:text-gray-400 focus:border-[#F4781B] focus:ring-2 focus:ring-[#F4781B]/15";

function FieldLabel({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
        {children}
        {required ? <span className="text-[#F4781B]"> *</span> : null}
      </label>
      {hint ? <span className="text-xs text-gray-400 tabular-nums">{hint}</span> : null}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status in STATUS_COLORS
      ? STATUS_COLORS[status as SupportTicketStatus]
      : "bg-gray-100 text-gray-500";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}
    >
      {supportStatusLabel(status)}
    </span>
  );
}

function formatWhen(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function titleErrorMessage(value: string): string | undefined {
  const length = value.trim().length;
  if (length < SUPPORT_TITLE_MIN || length > SUPPORT_TITLE_MAX) {
    return "Title must be 3–200 characters.";
  }
  return undefined;
}

function descriptionErrorMessage(value: string): string | undefined {
  const length = value.trim().length;
  if (length < SUPPORT_DESCRIPTION_MIN || length > SUPPORT_DESCRIPTION_MAX) {
    return "Description must be 10–2000 characters.";
  }
  return undefined;
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function AttachmentPreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  if (!url) return null;

  if (isPdfFile(file)) {
    return (
      <iframe
        src={url}
        title={file.name}
        className="h-[70vh] w-full rounded-xl border border-gray-200 bg-gray-50"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={file.name}
      className="max-h-[70vh] w-full rounded-xl bg-gray-50 object-contain"
    />
  );
}

function validateAttachment(file: File): string | null {
  const name = file.name.toLowerCase();
  const allowed = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!allowed) return "Only JPG, PNG, or PDF files are allowed.";
  if (file.size > SUPPORT_MAX_FILE_BYTES) {
    return `Each file must be 5MB or smaller. ${file.name} is ${formatFileSize(file.size)}.`;
  }
  return null;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <tr key={index} className="border-b border-gray-50">
          {Array.from({ length: LIST_HEADERS.length }).map((__, cell) => (
            <td key={cell} className="px-4 py-4">
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function SupportPage() {
  const [issueType, setIssueType] = useState<SupportIssueType>("creating_urgent_jobs");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    description?: string;
    documents?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

  const [statusFilter, setStatusFilter] = useState<"ALL" | SupportTicketStatus>("ALL");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [listVersion, setListVersion] = useState(0);

  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportTicket | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailVersion, setDetailVersion] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    if (!dropdownOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [dropdownOpen]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setListLoading(true);
        setListError(null);
        const result = await listSupportTickets({
          page,
          limit: perPage,
          offset: (page - 1) * perPage,
          ...(statusFilter === "ALL" ? {} : { status: statusFilter }),
        });
        if (cancelled) return;
        setTickets(result.tickets ?? []);
        setTotalItems(result.pagination?.total ?? result.tickets?.length ?? 0);
      } catch (error) {
        if (!cancelled) {
          setTickets([]);
          setTotalItems(0);
          setListError(error instanceof Error ? error.message : "Failed to load requests");
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, page, perPage, listVersion]);

  useEffect(() => {
    if (!openTicketId) return;
    const ticketId = openTicketId;
    let cancelled = false;
    async function load() {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const ticket = await getSupportTicket(ticketId);
        if (!cancelled) setDetail(ticket);
      } catch (error) {
        if (!cancelled) {
          setDetail(null);
          setDetailError(error instanceof Error ? error.message : "Failed to load request");
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [openTicketId, detailVersion]);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const next = [...files];
    let error: string | null = null;
    for (const file of Array.from(list)) {
      if (next.length >= SUPPORT_MAX_FILES) {
        error = "You can attach up to 3 files.";
        break;
      }
      const invalid = validateAttachment(file);
      if (invalid) {
        error = invalid;
        continue;
      }
      next.push(file);
    }
    setFiles(next);
    setFieldErrors((current) => ({ ...current, documents: error ?? undefined }));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: { title?: string; description?: string; documents?: string } = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const titleError = titleErrorMessage(title);
    const descriptionError = descriptionErrorMessage(description);

    if (titleError) nextErrors.title = titleError;
    if (descriptionError) nextErrors.description = descriptionError;
    if (files.length > SUPPORT_MAX_FILES) {
      nextErrors.documents = "You can attach up to 3 files.";
    }

    setFieldErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      const ticket = await createSupportTicket({
        issue_type: issueType,
        title: trimmedTitle,
        description: trimmedDescription,
        documents: files,
      });
      setCreatedTicket(ticket);
      setTitle("");
      setDescription("");
      setFiles([]);
      setPreviewFile(null);
      setIssueType("creating_urgent_jobs");
      setStatusFilter("ALL");
      setPage(1);
      setListVersion((version) => version + 1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit this request");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedLabel = supportIssueLabel(issueType);
  const adminHandled = Boolean(detail?.admin_note || detail?.resolved_at);
  const emptyTitle =
    statusFilter === "ALL"
      ? "No requests yet"
      : `No ${supportStatusLabel(statusFilter).toLowerCase()} requests`;
  const emptyBody =
    statusFilter === "ALL"
      ? "Submit a request above and it will show up here."
      : "Choose another status, or send a new request.";

  function openTicket(ticketId: string) {
    setDetail(null);
    setOpenTicketId(ticketId);
  }

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-5 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help &amp; Support</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send a request and track the reply. We respond within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="w-full">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-5 sm:px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">New request</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Title and description are required. Attachments are optional.
              </p>
            </div>

            <div className="flex flex-col gap-5 px-5 sm:px-6 py-5">
            {createdTicket && (
              <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={18} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Request submitted</p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {createdTicket.ticket_number} is open. We will reply within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => openTicket(createdTicket.id)}
                    className="mt-1.5 text-sm font-medium text-[#F4781B] hover:underline"
                  >
                    View request
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
                <FieldLabel htmlFor="support-issue-type">Issue type</FieldLabel>
                <button
                  id="support-issue-type"
                  type="button"
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="listbox"
                  className={`${fieldClassName} flex items-center justify-between text-left hover:border-gray-300`}
                >
                  <span className="truncate">{selectedLabel}</span>
                  <ChevronDown
                    size={15}
                    className={`text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden"
                  >
                    {SUPPORT_ISSUE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        role="option"
                        aria-selected={issueType === type.value}
                        onClick={() => {
                          setIssueType(type.value);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-orange-50 hover:text-[#F4781B] ${
                          issueType === type.value
                            ? "bg-orange-50 text-[#F4781B] font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel
                  htmlFor="support-title"
                  required
                  hint={`${title.length}/${SUPPORT_TITLE_MAX}`}
                >
                  Title
                </FieldLabel>
                <input
                  id="support-title"
                  type="text"
                  value={title}
                  maxLength={SUPPORT_TITLE_MAX}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={fieldErrors.title ? "support-title-error" : undefined}
                  onChange={(event) => {
                    const next = event.target.value.slice(0, SUPPORT_TITLE_MAX);
                    setTitle(next);
                    if (fieldErrors.title && !titleErrorMessage(next)) {
                      setFieldErrors((current) => ({ ...current, title: undefined }));
                    }
                  }}
                  onBlur={() => {
                    if (!title.trim() && !fieldErrors.title) return;
                    setFieldErrors((current) => ({
                      ...current,
                      title: titleErrorMessage(title),
                    }));
                  }}
                  placeholder="Short summary of the issue"
                  className={`${fieldClassName} ${fieldErrors.title ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                />
                {fieldErrors.title ? (
                  <p id="support-title-error" className="text-xs text-red-500">
                    {fieldErrors.title}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel
                htmlFor="support-description"
                required
                hint={`${description.length}/${SUPPORT_DESCRIPTION_MAX}`}
              >
                Description
              </FieldLabel>
              <textarea
                id="support-description"
                value={description}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={fieldErrors.description ? "support-description-error" : undefined}
                onChange={(event) => {
                  const next = event.target.value.slice(0, SUPPORT_DESCRIPTION_MAX);
                  setDescription(next);
                  if (fieldErrors.description && !descriptionErrorMessage(next)) {
                    setFieldErrors((current) => ({ ...current, description: undefined }));
                  }
                }}
                onBlur={() => {
                  if (!description.trim() && !fieldErrors.description) return;
                  setFieldErrors((current) => ({
                    ...current,
                    description: descriptionErrorMessage(description),
                  }));
                }}
                rows={4}
                placeholder="What happened, what you expected, and what you already tried."
                className={`${fieldClassName} resize-y min-h-28 ${
                  fieldErrors.description ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""
                }`}
              />
              {fieldErrors.description ? (
                <p id="support-description-error" className="text-xs text-red-500">
                  {fieldErrors.description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel hint={files.length ? `${files.length}/${SUPPORT_MAX_FILES}` : "Optional"}>
                Attachments
              </FieldLabel>
              {files.length < SUPPORT_MAX_FILES && (
                <div
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      fileRef.current?.click();
                    }
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    dragDepth.current += 1;
                    setIsDragging(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    dragDepth.current -= 1;
                    if (dragDepth.current <= 0) {
                      dragDepth.current = 0;
                      setIsDragging(false);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    dragDepth.current = 0;
                    setIsDragging(false);
                    addFiles(event.dataTransfer.files);
                  }}
                  role="button"
                  tabIndex={0}
                  className={`flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3.5 cursor-pointer transition-colors ${
                    isDragging
                      ? "border-[#F4781B] bg-orange-50"
                      : "border-gray-200 hover:border-[#F4781B] hover:bg-orange-50/40"
                  }`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#F4781B]">
                    <Upload size={18} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-medium text-gray-800">
                      Drop files here, or browse
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      JPG, PNG, or PDF. Up to 3 files, 5MB each.
                    </span>
                  </span>
                </div>
              )}

              {files.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F4781B]">
                        <FileText size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-800">
                          {file.name}
                        </span>
                        <span className="block text-xs text-gray-400">
                          {formatFileSize(file.size)}
                        </span>
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#F4781B] hover:bg-orange-50"
                          aria-label={`Preview ${file.name}`}
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFiles((current) =>
                              current.filter((_, fileIndex) => fileIndex !== index),
                            );
                            setPreviewFile((current) => (current === file ? null : current));
                            setFieldErrors((current) => ({ ...current, documents: undefined }));
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={14} />
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {fieldErrors.documents ? (
                <p className="text-xs text-red-500">{fieldErrors.documents}</p>
              ) : null}
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                multiple
                className="hidden"
                onChange={(event) => addFiles(event.target.files)}
              />
            </div>

            {submitError ? (
              <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </p>
            ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-gray-500">We reply within 24 hours.</p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center bg-[#F4781B] hover:bg-orange-600 disabled:opacity-70 text-white font-semibold text-sm rounded-full pl-6 pr-1.5 py-1.5 h-11 transition-colors gap-3 sm:w-auto"
              >
                <span>{isSubmitting ? "Submitting..." : "Get Support"}</span>
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                  <ChevronRight size={16} className="text-gray-800" strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 sm:px-6 pt-5">
            <h2 className="text-base font-semibold text-gray-900">Your requests</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Filter by status to see what is open, in progress, or already handled.
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between px-2 sm:px-4 border-b border-gray-100">
            <TableTabs
              tabs={STATUS_TABS}
              activeTab={statusFilter}
              onTabChange={(tab) => {
                setStatusFilter(tab);
                setPage(1);
              }}
              tabClassName="relative px-4 sm:px-5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap"
            />
          </div>

          {listError ? (
            <div className="px-4 py-16 text-center">
              <p className="text-sm font-medium text-gray-800">Could not load requests</p>
              <p className="text-sm text-gray-500 mt-1">{listError}</p>
              <button
                type="button"
                onClick={() => setListVersion((version) => version + 1)}
                className="mt-3 text-sm font-medium text-[#F4781B] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : !listLoading && tickets.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-50 text-[#F4781B]">
                <LifeBuoy size={22} />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{emptyTitle}</p>
              <p className="mt-1 text-sm text-gray-500">{emptyBody}</p>
            </div>
          ) : (
          <DataTable headers={LIST_HEADERS} minWidthClassName="min-w-[760px]">
            {listLoading ? (
              <SkeletonRows />
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => openTicket(ticket.id)}
                  className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4 whitespace-nowrap font-mono text-[13px] text-gray-700">
                    {ticket.ticket_number}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                    {supportIssueLabel(ticket.issue_type)}
                  </td>
                  <td className="px-4 py-4 text-gray-800 max-w-[240px]">
                    <span className="line-clamp-2">{ticket.title}</span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill status={ticket.status} />
                  </td>
                  <td className="px-4 py-4 text-gray-600">{ticket.attachment_count ?? 0}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[13px] text-gray-700">
                    {formatWhen(ticket.created_at)}
                  </td>
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => openTicket(ticket.id)}
                      className="text-[#F4781B] hover:text-orange-600 transition-colors"
                      aria-label={`View ${ticket.ticket_number}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </DataTable>
          )}

          {totalItems > 0 && (
            <PaginationFooter
              page={page}
              totalItems={totalItems}
              perPage={perPage}
              onPageChange={setPage}
              itemLabel="requests"
              perPageOptions={PER_PAGE_OPTIONS}
              onPerPageChange={(nextPerPage) => {
                setPerPage(nextPerPage);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>

      <Dialog
        open={openTicketId != null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenTicketId(null);
            setDetail(null);
            setDetailError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8 text-gray-900">
              {detail?.ticket_number ?? "Support request"}
            </DialogTitle>
          </DialogHeader>

          {detailLoading && !detail ? (
            <p className="text-sm text-gray-400 animate-pulse">Loading request...</p>
          ) : detailError ? (
            <div className="text-center py-6">
              <p className="text-sm font-medium text-gray-800">Could not load this request</p>
              <p className="text-sm text-gray-500 mt-1">{detailError}</p>
              <button
                type="button"
                onClick={() => setDetailVersion((version) => version + 1)}
                className="mt-3 text-sm text-[#F4781B] font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          ) : detail ? (
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={detail.status} />
                <span className="text-gray-500">{supportIssueLabel(detail.issue_type)}</span>
              </div>

              <div>
                <p className="text-base font-semibold text-gray-900">{detail.title}</p>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">{detail.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
                <p>Opened {formatWhen(detail.created_at)}</p>
                <p>Updated {formatWhen(detail.updated_at)}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Support response
                </p>
                {adminHandled ? (
                  <div className="mt-2 flex flex-col gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Admin note</p>
                      <p className="mt-1 whitespace-pre-wrap text-gray-800">
                        {detail.admin_note || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Resolved</p>
                      <p className="mt-1 text-gray-800">{formatWhen(detail.resolved_at)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-gray-600">
                    Waiting for a reply. The admin note and resolved time show here after this
                    request is handled.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-gray-500">Attachments</p>
                  <button
                    type="button"
                    onClick={() => setDetailVersion((version) => version + 1)}
                    disabled={detailLoading}
                    className="inline-flex items-center gap-1 text-xs text-[#F4781B] font-medium hover:underline disabled:opacity-60"
                  >
                    <RefreshCw size={12} className={detailLoading ? "animate-spin" : ""} />
                    Refresh links
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Download links expire 5 minutes after they are issued.
                </p>
                {(detail.attachments ?? []).length === 0 ? (
                  <p className="mt-2 text-gray-500">No files attached.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {detail.attachments?.map((attachment) => (
                      <li
                        key={attachment.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-[#F4781B] font-medium hover:underline"
                          >
                            {attachment.file_name}
                          </a>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(attachment.file_size)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={previewFile != null}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8 truncate text-gray-900">
              {previewFile?.name ?? "Preview"}
            </DialogTitle>
          </DialogHeader>
          {previewFile ? <AttachmentPreview file={previewFile} /> : null}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
