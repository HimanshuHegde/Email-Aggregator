
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  message = "Are you sure you want to delete this account?",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal Box */}
      <div className="bg-white rounded-xl shadow-lg w-96 p-6 text-center">
        <p className="text-lg mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
                onClick={onConfirm}
                className="bg-black text-white px-4 py-2 rounded-xl shadow-md hover:bg-gray-800"
              >
                Delete
              </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
