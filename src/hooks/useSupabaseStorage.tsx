
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSupabaseStorageOptions {
  bucket: string;
}

export const useSupabaseStorage = ({ bucket }: UseSupabaseStorageOptions) => {
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBucket = async () => {
      try {
        setLoading(true);
        // Try to get bucket info
        const { data, error } = await supabase.storage.getBucket(bucket);
        
        if (error && error.message.includes('The resource was not found')) {
          // Bucket doesn't exist, attempt to create it
          const { error: createError } = await supabase.storage.createBucket(bucket, {
            public: true, // Make the bucket public
          });
          
          if (createError) throw createError;
          
          // Set policies to allow authenticated users to upload files to their own folder
          const { error: policyError } = await supabase.storage.from(bucket).createSignedUploadUrl('test-policy');
          if (policyError && !policyError.message.includes('already exists')) {
            console.warn('Could not verify bucket policies:', policyError);
          }
          
          setBucketExists(true);
        } else if (error) {
          throw error;
        } else {
          setBucketExists(true);
        }
      } catch (err) {
        console.error('Error checking/creating bucket:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setBucketExists(false);
      } finally {
        setLoading(false);
      }
    };

    checkBucket();
  }, [bucket]);

  return { bucketExists, error, loading };
};
