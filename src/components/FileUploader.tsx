import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload,
  X,
  File,
  FileText,
  Image,
  Music,
  Archive,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileAttachment {
  id: string;
  name: string;
  file_type: string;
  size: number;
  uploaded_by?: string;
  created_at?: string;
}

interface Props {
  attachments: FileAttachment[];
  onFileUpload?: (file: File) => Promise<void>;
  onFileDelete?: (fileId: string) => Promise<void>;
  disabled?: boolean;
}

export function FileUploader({
  attachments,
  onFileUpload,
  onFileDelete,
  disabled,
}: Props) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
      case "doc":
      case "text":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "image":
        return <Image className="h-4 w-4 text-blue-500" />;
      case "audio":
        return <Music className="h-4 w-4 text-purple-500" />;
      case "archive":
        return <Archive className="h-4 w-4 text-orange-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    for (const file of files) {
      await handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!onFileUpload) return;

    setIsUploading(true);
    try {
      await onFileUpload(file);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      for (const file of files) {
        handleFileSelect(file);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
          accept="*"
        />

        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">Arraste arquivos aqui ou clique</p>
        <p className="text-xs text-muted-foreground">
          Qualquer tipo de arquivo até 100MB
        </p>

        {isUploading && (
          <p className="text-xs text-primary mt-2">Enviando...</p>
        )}
      </div>

      {/* Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {attachments.length} arquivo{attachments.length !== 1 ? "s" : ""}
          </h4>
          <div className="space-y-2">
            {attachments.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getFileIcon(file.file_type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          onFileDelete && onFileDelete(file.id)
                        }
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
