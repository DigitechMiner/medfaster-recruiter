"use client";

import { useRef, useState, useEffect } from "react";
import { Smile, Plus, Mic, ThumbsUp, Send, X, FileText, ImageIcon, Film, Square } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

interface Props {
  value: string;
  sending: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
  onSendFile: (file: File) => Promise<void>;
  onSendVoice: (blob: Blob, duration: string) => Promise<void>;
}

// ── Attachment picker options ──────────────────────────────────────────────
const ATTACH_OPTIONS = [
  { label: "Image",    icon: ImageIcon,  accept: "image/*" },
  { label: "Video",    icon: Film,       accept: "video/*" },
  { label: "Document", icon: FileText,   accept: ".pdf,.doc,.docx,.xlsx,.txt" },
];

// ── Format mm:ss ───────────────────────────────────────────────────────────
const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export const MessageInput = ({ value, sending, onChange, onSend, onSendFile, onSendVoice }: Props) => {
  // ── Attachment state ─────────────────────────────────────────────────────
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentAccept, setCurrentAccept]  = useState("*/*");
  const [attachPreview, setAttachPreview]  = useState<{ file: File; url: string } | null>(null);
  const [uploadingFile, setUploadingFile]  = useState(false);

  // ── Voice state ──────────────────────────────────────────────────────────
  const [recording, setRecording]          = useState(false);
  const [recordingDone, setRecordingDone]  = useState(false);
  const [elapsed, setElapsed]              = useState(0);
  const [voiceBlob, setVoiceBlob]          = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cleanup timer on unmount ─────────────────────────────────────────────
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Attachment handlers ──────────────────────────────────────────────────
  const openFilePicker = (accept: string) => {
    setCurrentAccept(accept);
    setShowAttachMenu(false);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachPreview({ file, url });
    e.target.value = "";
  };

  const handleSendFile = async () => {
    if (!attachPreview) return;
    setUploadingFile(true);
    try {
      await onSendFile(attachPreview.file);
      URL.revokeObjectURL(attachPreview.url);
      setAttachPreview(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const cancelAttach = () => {
    if (attachPreview) URL.revokeObjectURL(attachPreview.url);
    setAttachPreview(null);
  };

  // ── Voice handlers ───────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setVoiceBlob(blob);
        setRecordingDone(true);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setElapsed(0);
      setRecording(true);
      setRecordingDone(false);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access denied. Please allow mic permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const sendVoice = async () => {
    if (!voiceBlob) return;
    await onSendVoice(voiceBlob, formatDuration(elapsed));
    setVoiceBlob(null);
    setRecordingDone(false);
    setElapsed(0);
  };

  const cancelVoice = () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(false);
    }
    setVoiceBlob(null);
    setRecordingDone(false);
    setElapsed(0);
  };

  // ── Attachment preview bar ────────────────────────────────────────────────
  if (attachPreview) {
    const isImage = attachPreview.file.type.startsWith("image/");
    const isVideo = attachPreview.file.type.startsWith("video/");
    return (
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
        {/* Preview */}
        <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          {isImage && (
            <Image src={attachPreview.url} alt="preview" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
          )}
          {isVideo && (
            <video src={attachPreview.url} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" muted />
          )}
          {!isImage && !isVideo && (
            <div className="w-14 h-14 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <FileText size={24} className="text-[#F4781B]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{attachPreview.file.name}</p>
            <p className="text-xs text-gray-400">{(attachPreview.file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button type="button" onClick={cancelAttach} className="text-gray-400 hover:text-red-400 transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={cancelAttach}
            className="px-4 py-2 text-xs text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendFile}
            disabled={uploadingFile}
            className="px-4 py-2 text-xs text-white bg-[#F4781B] rounded-xl hover:bg-[#d5650e] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploadingFile
              ? <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> Sending...</>
              : <><Send size={13} /> Send</>
            }
          </button>
        </div>
      </div>
    );
  }

  // ── Voice recording bar ───────────────────────────────────────────────────
  if (recording || recordingDone) {
    return (
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        {/* Animated mic indicator */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${recording ? "bg-red-500 animate-pulse" : "bg-gray-200"}`}>
          <Mic size={15} className={recording ? "text-white" : "text-gray-500"} />
        </div>

        {/* Waveform bars (decorative) */}
        <div className="flex items-center gap-[3px] flex-1 h-8">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`w-[2px] rounded-full transition-all ${recording ? "bg-red-400" : "bg-gray-300"}`}
              style={{
                height: recording
                  ? `${8 + Math.abs(Math.sin((Date.now() / 200 + i) * 0.8)) * 20}px`
                  : "6px",
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <span className={`text-sm font-mono font-medium flex-shrink-0 ${recording ? "text-red-500" : "text-gray-500"}`}>
          {formatDuration(elapsed)}
        </span>

        {/* Stop recording */}
        {recording && (
          <button
            type="button"
            onClick={stopRecording}
            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0"
            title="Stop recording"
          >
            <Square size={12} className="text-white fill-white" />
          </button>
        )}

        {/* Cancel */}
        <button
          type="button"
          onClick={cancelVoice}
          className="text-gray-400 hover:text-red-400 transition-colors p-1 flex-shrink-0"
          title="Discard"
        >
          <X size={18} />
        </button>

        {/* Send voice */}
        {recordingDone && (
          <button
            type="button"
            onClick={sendVoice}
            className="w-9 h-9 bg-[#F4781B] rounded-full flex items-center justify-center hover:bg-[#d5650e] transition-colors flex-shrink-0"
            title="Send voice note"
          >
            <Send size={16} className="text-white" />
          </button>
        )}
      </div>
    );
  }

  // ── Default input bar ─────────────────────────────────────────────────────
  return (
    <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0 relative">
      <button type="button" className="text-gray-400 hover:text-[#F4781B] transition-colors p-1">
        <Smile size={20} />
      </button>

      <input
        type="text"
        placeholder="Type your message here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
        className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none border border-gray-200 focus:border-[#F4781B] transition-colors"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={currentAccept}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Attachment button + popup menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAttachMenu((v) => !v)}
          className="text-gray-400 hover:text-[#F4781B] transition-colors p-1"
          title="Attach file"
        >
          <Plus size={20} className={showAttachMenu ? "text-[#F4781B] rotate-45 transition-transform" : "transition-transform"} />
        </button>

        {showAttachMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
            <div className="absolute bottom-10 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20 min-w-[150px]">
              {ATTACH_OPTIONS.map(({ label, icon: Icon, accept }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => openFilePicker(accept)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F4781B] flex items-center gap-3 transition-colors"
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mic button */}
      <button
        type="button"
        onClick={startRecording}
        className="text-gray-400 hover:text-[#F4781B] transition-colors p-1"
        title="Record voice note"
      >
        <Mic size={20} />
      </button>

      {value.trim() ? (
        <button
          type="button"
          onClick={onSend}
          disabled={sending}
          className="w-9 h-9 bg-[#F4781B] rounded-full flex items-center justify-center hover:bg-[#d5650e] transition-colors disabled:opacity-50"
        >
          <Send size={16} className="text-white" />
        </button>
      ) : (
        <button type="button" className="text-gray-400 hover:text-[#F4781B] transition-colors p-1">
          <ThumbsUp size={20} />
        </button>
      )}
    </div>
  );
};