import { Trash2, X } from 'lucide-react';
import Button from '../ui/Button';

interface DeleteAudioModalProps {
  open: boolean;
  voiceName?: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting?: boolean;
}

const DeleteAudioModal = ({ open, voiceName, onCancel, onConfirm, deleting = false }: DeleteAudioModalProps) => {
  if (!open) return null;

  const handleCancel = () => {
    if (!deleting) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full mx-4 p-6">
        {!deleting && (
          <button
            onClick={handleCancel}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/40">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete generated audio?</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          This will permanently remove
          {voiceName ? ` “${voiceName}” and its generated audio file.` : ' this generated audio clip.'}
          This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="danger"
            isLoading={deleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAudioModal;
