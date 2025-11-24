import { useState } from 'react';
import { X, Save } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface EndInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
  isLoading?: boolean;
}

const EndInterviewModal = ({ isOpen, onClose, onConfirm, isLoading = false }: EndInterviewModalProps) => {
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(title.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
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
        {!isLoading && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Save Interview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Give your interview a memorable title before ending the session.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label 
              htmlFor="interview-title" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Interview Title
            </label>
            <Input
              id="interview-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., JavaScript Senior Developer Interview"
              disabled={isLoading}
              autoFocus
              className="w-full"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Leave blank for auto-generated title (e.g., "Interview 1")
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  End & Save
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EndInterviewModal;

