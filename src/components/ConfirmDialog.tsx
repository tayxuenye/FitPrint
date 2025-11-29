'use client';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'default';
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default',
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const confirmButtonClass = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-purple-600 hover:bg-purple-700 text-white';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-xl mx-auto">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    {message}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

