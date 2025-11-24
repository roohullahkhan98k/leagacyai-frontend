import React, { useCallback, useState } from 'react';
import { Upload, X, FileImage, FileVideo, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadSingle, uploadMultiple, MediaFile } from '../../services/multimediaApi';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: MediaFile;
}

interface MediaUploaderProps {
  onUploadComplete?: (files: MediaFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 100,
  acceptedTypes = ['image/*', 'video/*'],
  className = '',
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);


  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
    
    if (!isValidType) {
      return 'Invalid file type. Please upload images or videos only.';
    }
    
    return null;
  };

  const createPreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: UploadedFile[] = [];
    
    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        onUploadError?.(error);
        return;
      }
      
      if (files.length + validFiles.length >= maxFiles) {
        onUploadError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }
      
      validFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: createPreview(file),
        status: 'pending',
      });
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  }, [files.length, maxFiles, acceptedTypes, maxFileSize, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  }, [addFiles]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      if (files.length === 1) {
        const singleResult = await uploadSingle(files[0].file);
        
        setFiles(prev => prev.map(f => 
          f.id === files[0].id 
            ? { 
                ...f, 
                status: 'success', 
                result: {
                  id: singleResult.data.mediaId,
                  originalName: singleResult.data.originalName,
                  filename: singleResult.data.filename,
                  path: singleResult.data.downloadUrl,
                  type: singleResult.data.type as 'image' | 'video',
                  mimeType: files[0].file.type,
                  metadata: singleResult.data.metadata,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } as MediaFile
              }
            : f
        ));
        
        onUploadComplete?.([{
          id: singleResult.data.mediaId,
          originalName: singleResult.data.originalName,
          filename: singleResult.data.filename,
          path: singleResult.data.downloadUrl,
          type: singleResult.data.type as 'image' | 'video',
          mimeType: files[0].file.type,
          metadata: singleResult.data.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as MediaFile]);
      } else {
        const multipleResult = await uploadMultiple(files.map(f => f.file));
        
        setFiles(prev => prev.map((f, index) => {
          const uploadedItem = multipleResult.data.uploaded[index];
          if (!uploadedItem) {
            return { ...f, status: 'error', error: 'Upload failed' };
          }
          return {
            ...f,
            status: 'success',
            result: {
              id: uploadedItem.mediaId,
              originalName: uploadedItem.originalName,
              filename: uploadedItem.filename,
              path: uploadedItem.downloadUrl,
              type: uploadedItem.type as 'image' | 'video',
              mimeType: f.file.type,
              metadata: uploadedItem.metadata,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as MediaFile
          };
        }));
        
        const uploadedFiles: MediaFile[] = multipleResult.data.uploaded.map((uploadedItem) => ({
          id: uploadedItem.mediaId,
          originalName: uploadedItem.originalName,
          filename: uploadedItem.filename,
          path: uploadedItem.downloadUrl,
          type: uploadedItem.type as 'image' | 'video',
          mimeType: uploadedItem.type === 'image' ? 'image/jpeg' : 'video/mp4', // Default mime types
          metadata: uploadedItem.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as MediaFile));
        
        onUploadComplete?.(uploadedFiles);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ));
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [files, onUploadComplete, onUploadError]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-6 w-6 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <FileVideo className="h-6 w-6 text-purple-500" />;
    }
    return <Upload className="h-6 w-6 text-gray-500" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <Upload className="h-8 w-8 text-primary-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Drag & drop your files here
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              or click to browse files
            </p>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Supports images (JPEG, PNG, TIFF, WebP) and videos (MP4, AVI, MOV, WMV, MKV)</p>
            <p>Maximum {maxFileSize}MB per file, up to {maxFiles} files</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Files ({files.length})
            </h4>
            <Button
              onClick={uploadFiles}
              disabled={isUploading || files.every(f => f.status !== 'pending')}
              className="flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload All</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-shrink-0">
                  {file.file.type.startsWith('image/') ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      {getFileIcon(file.file)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {file.error && (
                    <p className="text-xs text-red-500 truncate">
                      {file.error}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
