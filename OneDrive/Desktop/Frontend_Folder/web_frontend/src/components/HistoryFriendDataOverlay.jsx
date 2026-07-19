import { useState, useMemo, useEffect } from 'react';
import API_BASE_URL from '../utils/api';

const HistoryFriendDataOverlay = ({ friend, onClose }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/transactions/friend/${friend.friendId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data);
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [friend.friendId, token]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Invalid Date';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Invalid Date';
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
            ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-40 bg-white dark:bg-gray-900 flex flex-col items-center justify-center" style={{ top: '64px' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-40 bg-white dark:bg-gray-900 flex flex-col items-center" style={{ top: '64px' }}>
            
            {}
            <div className="w-full shadow-xl max-w-2xl h-full flex flex-col ">
                
                {}
                <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 text-xl"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{friend.friendName}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {transactions.length} transactions
                            </p>
                        </div>
                    </div>
                </div>

                {}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
                    {transactions.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No transactions found
                        </p>
                    ) : (
                        transactions.map(tx => {
                            const isGiven = tx.type === 'given' || tx.type === 'GIVEN';
                            const isPending = tx.status === 'pending' || tx.status === 'PENDING';
                            const isDeletedTx = tx.isDeleted === true;

                            return (
                                <div key={tx.id} className={`flex ${isGiven ? 'justify-end' : 'justify-start'}`}>
                                    {}
                                    <div className={`w-[50%] rounded-xl p-3 transition-all ${
                                        isDeletedTx 
                                            ? 'bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500'
                                            : isPending 
                                                ? 'bg-gray-200 dark:bg-gray-600 border-l-4 ' + (isGiven ? 'border-green-500 dark:border-green-400' : 'border-red-500 dark:border-red-400')
                                                : 'bg-gray-50 dark:bg-gray-600/30 border-l-4 border-gray-200 dark:border-gray-700'
                                    }`}>
                                        
                                        <p className={`font-medium text-sm ${
                                            isDeletedTx 
                                                ? 'text-gray-500 dark:text-gray-400 line-through'
                                                : isPending ? 'text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {tx.reason || 'No reason'}
                                        </p>

                                        <div className="flex justify-between items-center mt-1">
                                            <p className={`text-xs ${
                                                isDeletedTx 
                                                    ? 'text-gray-400 dark:text-gray-500'
                                                    : isPending ? 'text-gray-400 dark:text-gray-400' : 'text-gray-400 dark:text-gray-400'
                                            }`}>
                                                {formatDate(tx.transactionDate || tx.date)}
                                            </p>
                                            <p className={`text-base font-bold ${
                                                isDeletedTx 
                                                    ? 'text-gray-400 dark:text-gray-500 line-through'
                                                    : isGiven
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                ₹{tx.amount}
                                            </p>
                                        </div>

                                        <div className="flex items-center mt-2">
                                            <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                                                isDeletedTx
                                                    ? 'bg-gray-300 dark:bg-gray-500 text-gray-500 dark:text-gray-300'
                                                    : isPending
                                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                                        : 'bg-gray-100 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {isDeletedTx ? '🗑️ Deleted' : isPending ? '⏳ Pending' : '✅ Settled'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {}
                <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3 pb-2 bg-white dark:bg-gray-900">
                    <button 
                        onClick={onClose}
                        className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HistoryFriendDataOverlay;