
import React from 'react';
import EnhancedImageUpload from './EnhancedImageUpload';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onRemoveImage?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  currentImage, 
  onRemoveImage 
}) => {
  return (
    <EnhancedImageUpload
      onImageUploaded={onImageUploaded}
      currentImage={currentImage}
      onRemoveImage={onRemoveImage}
      bucket="article-images"
      label="Upload a featured image for your article"
      folder="featured"
    />
  );
};

export default ImageUpload;
