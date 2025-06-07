
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileUploadOptions {
  bucket: string;
  maxSize?: number;
  allowedTypes?: string[];
  folder?: string;
}

export interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const useFileUpload = () => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  });

  const uploadFile = async (
    file: File, 
    userId: string, 
    options: FileUploadOptions
  ): Promise<string | null> => {
    const { bucket, maxSize = 50 * 1024 * 1024, allowedTypes, folder } = options;

    try {
      setUploadProgress({ progress: 0, status: 'uploading' });

      // Validate file type
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      }

      // Create unique filename with user folder structure
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const folderPath = folder ? `${folder}/` : '';
      const fileName = `${userId}/${folderPath}${timestamp}-${randomId}.${fileExt}`;

      // Simulate progress updates
      setUploadProgress({ progress: 25, status: 'uploading' });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: false,
          cacheControl: '3600'
        });

      if (error) throw error;

      setUploadProgress({ progress: 75, status: 'uploading' });

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setUploadProgress({ progress: 100, status: 'success' });

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      setUploadProgress({ 
        progress: 0, 
        status: 'error', 
        error: error.message 
      });

      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });

      return null;
    }
  };

  const deleteFile = async (filePath: string, bucket: string) => {
    try {
      // Extract the storage path from the full URL if needed
      const storagePath = filePath.includes('/storage/v1/object/public/') 
        ? filePath.split(`/storage/v1/object/public/${bucket}/`)[1]
        : filePath;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([storagePath]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "File deleted successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetProgress = () => {
    setUploadProgress({ progress: 0, status: 'idle' });
  };

  return {
    uploadFile,
    deleteFile,
    uploadProgress,
    resetProgress,
    isUploading: uploadProgress.status === 'uploading',
  };
};
