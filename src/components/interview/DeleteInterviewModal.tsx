import { X, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface DeleteInterviewModalProps {
  isOpen: boolean;
  interviewTitle: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteInterviewModal = ({ 
  isOpen, 
  interviewTitle, 
  onClose, 
  onConfirm, 
  isDeleting = false 
}: DeleteInterviewModalProps) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        {!isDeleting && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-100 dark:bg-error-900/30 mb-4">
          <AlertTriangle className="h-6 w-6 text-error-600 dark:text-error-400" />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Delete Interview?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">"{interviewTitle}"</span>?
          </p>
          <p className="text-sm text-error-600 dark:text-error-400 mt-2">
            This action cannot be undone. All Q&A pairs will be permanently deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onConfirm}
            disabled={isDeleting}
            className="border-error-600 text-error-600 hover:bg-error-50 dark:border-error-400 dark:text-error-400 dark:hover:bg-error-900/30"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-error-600/30 border-t-error-600 dark:border-error-400/30 dark:border-t-error-400 rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Yes, Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInterviewModal;

