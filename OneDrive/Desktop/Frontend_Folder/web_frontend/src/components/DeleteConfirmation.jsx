const DeleteConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete?',
    message = 'Are you sure you want to delete this?',
    confirmText = 'Delete',
    cancelText = 'Cencel',
    type = 'danger'
}) => {
    if(!isOpen) return null;

    const colors = {
        danger : {
            button : 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            icon : 'text-red-600'
        },
        warning: {
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
            icon: 'text-yellow-600'
        }
    };

    return(
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {}
                <div className="pt-6 text-center">
                    <div className={`text-5xl mb-2 ${colors[type].icon}`}>
                        {type === 'danger' ? '🗑️' : '⚠️'}
                    </div>
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 px-6">
                        {message}
                    </p>
                </div>
                <div className="p-6 flex gap-3">
                    <button
                         onClick={onClose}
                        className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 ${colors[type].button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmation;