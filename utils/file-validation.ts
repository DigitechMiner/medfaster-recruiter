function validateFile(
  file: File,
  maxSizeMB = 10,
  allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"],
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`,
    };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`,
    };
  }

  return { valid: true };
}

export function validateOrganizationPhoto(file: File) {
  return validateFile(file, 10, [".jpg", ".jpeg", ".png"]);
}

export function validateDocumentFile(file: File) {
  return validateFile(file, 10, [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}
