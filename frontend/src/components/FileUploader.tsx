import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { filesApi } from "@/lib/services";

interface FileUploaderProps {
  onFileUploaded: (fileId: string, filename: string) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUploader({
  onFileUploaded,
  accept = ".pdf",
  maxSize = 10 * 1024 * 1024,
  disabled = false,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await filesApi.uploadFile(file) as { id: string; filename?: string };
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadedFile({ id: response.id, name: response.filename || file.name });
      onFileUploaded(response.id, response.filename || file.name);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Upload failed";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }, [maxSize, onFileUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setUploadProgress(0);
  }, []);

  if (uploadedFile) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-uploaded-filename">
              {uploadedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">Uploaded successfully</p>
          </div>
          {!disabled && (
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              data-testid="button-remove-file"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50",
          "min-h-32 flex flex-col items-center justify-center gap-2 p-6"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={disabled ? undefined : handleDrop}
        data-testid="dropzone-file-upload"
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          data-testid="input-file-upload"
        />
        
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
            <Progress value={uploadProgress} className="w-full max-w-xs h-2" />
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              PDF files up to {maxSize / 1024 / 1024}MB
            </p>
          </>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive" data-testid="text-upload-error">
          {error}
        </p>
      )}
    </div>
  );
}
