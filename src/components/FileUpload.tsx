import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSize?: number;
  currentImage?: string;
}

export default function FileUpload({ 
  onUpload, 
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  currentImage
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        {isDragActive ? (
          <p className="text-blue-600">Déposez le fichier ici</p>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-600">
              Glissez-déposez un fichier ici, ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG jusqu'à {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>

      {currentImage && (
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={currentImage}
              alt="Aperçu"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
              }}
            />
          </div>
          <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-sm flex items-center gap-1">
            <ImageIcon className="w-4 h-4" />
            <span>Image actuelle</span>
          </div>
        </div>
      )}
    </div>
  );
}