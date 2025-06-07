
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFileUpload } from '@/hooks/useFileUpload';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarUploaded: (url: string) => void;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarUploaded,
  fallbackText = 'U',
  size = 'lg'
}) => {
  const { user } = useAuth();
  const { uploadFile, isUploading } = useFileUpload();

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const publicUrl = await uploadFile(file, user.id, {
      bucket: 'avatars',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    if (publicUrl) {
      onAvatarUploaded(publicUrl);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={currentAvatar} alt="Avatar" />
          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xl">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute -bottom-1 -right-1">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
