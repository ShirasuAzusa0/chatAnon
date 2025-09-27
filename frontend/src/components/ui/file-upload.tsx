import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect?: (file: File | null) => void;
  preview?: boolean;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function FileUpload({
  accept = 'image/*',
  maxSize = 5,
  onFileSelect,
  preview = true,
  className,
  disabled = false,
  placeholder = '选择文件或拖拽到此处',
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    setError('');

    // 验证文件类型
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError('不支持的文件类型');
      return;
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);

    // 创建预览 URL
    if (preview && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    onFileSelect?.(file);
  };

  // 处理文件输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      handleFileSelect(file);
    }
  };

  // 处理拖拽
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  // 清除文件
  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError('');
    onFileSelect?.(null);

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 打开文件选择器
  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // 清理预览 URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed p-6 transition-colors',
          dragActive && !disabled
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-destructive'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {preview && previewUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="预览"
                className="h-32 w-32 rounded-lg border object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={clearFile}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-muted-foreground text-sm">{selectedFile?.name}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
              {accept.includes('image') ? (
                <ImageIcon className="text-muted-foreground h-8 w-8" />
              ) : (
                <Upload className="text-muted-foreground h-8 w-8" />
              )}
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium">{placeholder}</p>
              <p className="text-muted-foreground text-xs">
                支持 {accept} 格式，最大 {maxSize}MB
              </p>
            </div>
            <Button type="button" variant="outline" onClick={openFileDialog} disabled={disabled}>
              <Upload className="mr-2 h-4 w-4" />
              选择文件
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
    </div>
  );
}
