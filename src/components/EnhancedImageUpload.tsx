
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Card, CardContent } from '@/components/ui/card';

interface EnhancedImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onRemoveImage?: () => void;
  bucket?: string;
  maxSize?: number;
  folder?: string;
  className?: string;
  label?: string;
  showPreview?: boolean;
}

const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({ 
  onImageUploaded, 
  currentImage, 
  onRemoveImage,
  bucket = 'article-images',
  maxSize = 50 * 1024 * 1024, // 50MB default
  folder,
  className = '',
  label = 'Upload Image',
  showPreview = true
}) => {
  const { user } = useAuth();
  const { uploadFile, uploadProgress, isUploading, resetProgress } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const handleFileUpload = async (file: File) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    resetProgress();

    const publicUrl = await uploadFile(file, user.id, {
      bucket,
      maxSize,
      allowedTypes: allowedImageTypes,
      folder
    });

    if (publicUrl) {
      onImageUploaded(publicUrl);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {currentImage && showPreview ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img 
                src={currentImage} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              {onRemoveImage && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={onRemoveImage}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedImageTypes.join(',')}
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
              
              <div className="space-y-4">
                {uploadProgress.status === 'error' ? (
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                ) : (
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                )}
                
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: {formatFileSize(maxSize)}
                  </p>
                </div>

                {uploadProgress.status === 'error' && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {uploadProgress.error}
                  </p>
                )}

                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isUploading}
                  className="pointer-events-none"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
            </div>

            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <Progress value={uploadProgress.progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedImageUpload;
