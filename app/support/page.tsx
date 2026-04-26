'use client';
import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { AppLayout } from '@/components/global/app-layout';

const ISSUE_TYPES = [
  'Creating Urgent Jobs',
  'Payment Issues',
  'Candidate Management',
  'Schedule Problems',
  'Account Settings',
  'Technical Issue',
  'Other',
];

const MAX_DESC = 100;

export default function SupportPage() {
  const [issueType,    setIssueType]    = useState('Creating Urgent Jobs');
  const [subject,      setSubject]      = useState('');
  const [email,        setEmail]        = useState('');
  const [mobile,       setMobile]       = useState('');
  const [description,  setDescription]  = useState('');
  const [file,         setFile]         = useState<File | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
            <ChevronRight size={28} className="text-[#F4781B]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Support request submitted!</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            We&apos;ve received your request and will get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 text-sm text-[#F4781B] font-medium hover:underline"
          >
            Submit another request
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout padding="none">
      <div className="p-4 md:p-6 xl:p-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Help &amp; Support</h1>

        <form onSubmit={handleSubmit} noValidate className="w-full">
          <div className="bg-white rounded-2xl border border-gray-200 px-8 pt-6 pb-8 flex flex-col gap-6 w-full">

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs text-gray-400">Select Issue Type</label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white hover:border-gray-300 transition-colors"
                >
                  <span className="truncate">{issueType}</span>
                  <ChevronDown
                    size={15}
                    className={`text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
                    {ISSUE_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setIssueType(type);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-orange-50 hover:text-[#F4781B] ${
                          issueType === type ? 'bg-orange-50 text-[#F4781B] font-medium' : 'text-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Wrong prescription listed..."
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#F4781B] transition-colors placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="emily.wilson@example.com"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#F4781B] transition-colors placeholder:text-gray-300"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Mobile Number</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="(319) 555-0115"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#F4781B] transition-colors placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400">Description</label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  rows={8}
                  placeholder="Please describe the issue in detail. We will get back to you within 24 hours."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#F4781B] transition-colors resize-none placeholder:text-gray-300"
                />
                <span className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none">
                  {description.length}/{MAX_DESC}
                </span>
              </div>
            </div>

            {/* Attach screenshot inside same white card */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400">Attach screenshot if any</p>

              <div
                onClick={() => fileRef.current?.click()}
                className="w-44 h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#F4781B] hover:bg-orange-50/30 transition-all"
              >
                {file ? (
                  <div className="flex flex-col items-center gap-1.5 px-3 text-center w-full">
                    <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                    >
                      <X size={11} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Plus size={18} className="text-gray-400" />
                    <span className="text-[11px] text-gray-400 text-center leading-snug px-2">
                      (Max size 5MB<br />(JPG, PNG, PDF))
                    </span>
                  </>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Get Support button inside same white card */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center bg-[#F4781B] hover:bg-orange-600 disabled:opacity-70 text-white font-semibold text-sm rounded-full pl-6 pr-1.5 py-1.5 h-11 transition-colors gap-3"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Get Support'}</span>
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                  <ChevronRight size={16} className="text-gray-800" strokeWidth={2.5} />
                </span>
              </button>
            </div>

          </div>
        </form>
      </div>
    </AppLayout>
  );
}