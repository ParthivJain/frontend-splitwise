import { useState, useMemo, useRef, useEffect } from 'react';
import AddExpenseModal from './AddExpenseModal';
import DeleteConfirmation from './DeleteConfirmation';
import API_BASE_URL from '../utils/api';

const FriendDataOverlay = ({ friend, onClose, onClose2, onBalanceUpdate }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteFriendConfirm, setShowDeleteFriendConfirm] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [friendToDelete, setFriendToDelete] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        const fetchTransactions = async() => {
            const token = localStorage.getItem('token');
            try{
                const response = await fetch(`${API_BASE_URL}/transactions/friend/${friend.friendId}`,{
                    headers : {'Authorization' : `Bearer ${token}`}
                });
                if(response.ok){
                    const data = await response.json();
                    setTransactions(data);
                }
            } catch(error){
                console.error('Error fetching transactions : ', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTransactions();
    }, [friend.id]);

    const toggleStatus = async (id) => {
        const token = localStorage.getItem('token');
        try{
            const response = await fetch(`${API_BASE_URL}/transactions/${id}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization' : `Bearer ${token}`}
            });
            if(response.ok){
                const data = await response.json();
                setTransactions(prev => 
                    prev.map(tx => tx.id === data.id ? data : tx)
                );
            }
        } catch (error) {
            console.error('Error in toggling status : ', error);
        }
    };

    const deleteTransaction = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setTransactions(prev => prev.filter(tx => tx.id !== id));
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const handleSettleAll = async () => {
        const token = localStorage.getItem('token');
        try{
            const response = await fetch(`${API_BASE_URL}/transactions/settle/${friend.friendId}`,{
                method: 'POST',
                headers: { 'Authorization' : `Bearer ${token}`}
            });
            if(response.ok){
                const transactionsRes = await fetch(`${API_BASE_URL}/transactions/friend/${friend.friendId}`, {
                    headers: {'Authorization' : `Bearer ${token}`}
                });
                const updatedTransaction = await transactionsRes.json();
                setTransactions(updatedTransaction);

                if(onBalanceUpdate){
                    onBalanceUpdate(0);
                }
            }
        } catch (error) {
            console.error('Error settling : ',error);
        }
    }
    
    const handleDeleteTransaction = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
        }
        setShowDeleteConfirm(false);
    };

    const handleAddExpense = (newTransaction) => {
        setTransactions(prev => [...prev, newTransaction]);
    };

    const handleEditClick = (transaction) => {
        setEditingTransaction(transaction);
        setShowEditModal(true);
    };

    const handleSaveEdit = async (updatedTransaction) => {
        setTransactions(prev =>
            prev.map(tx =>
                tx.id === updatedTransaction.id
                    ? { ...tx, amount: updatedTransaction.amount, reason: updatedTransaction.reason }
                    : tx
            )
        );
        const token = localStorage.getItem('token');
        try{
            const response = await fetch(`${API_BASE_URL}/transactions/${updatedTransaction.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: updatedTransaction.amount,
                    reason: updatedTransaction.reason
                })
            });
            if(response.ok){
                const data = await response.json();
                setTransactions(prev => 
                    prev.map(tx=> 
                        tx.id === data.id ? data : tx
                    )
                );
                setShowEditModal(false);
                setEditingTransaction(null);
            } else {
                const error = await response.text();
                alert(error || 'Failed to update transaction');
            }
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    const sortedTransactions = useMemo(() => {
        const activeTransactions = transactions.filter(tx => !tx.isDeleted);
        return [...activeTransactions].sort((a, b) =>
            new Date(a.transactionDate) - new Date(b.transactionDate)
        );
    }, [transactions]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [sortedTransactions]);
    const pendingCount = transactions.filter(tx => tx.status === 'pending' && !tx.isDeleted).length;

    const calculateBalance = () => {
        let total = 0;
        transactions.forEach(tx => {
            if(tx.type === 'given' && tx.status === 'pending' && tx.isDeleted===false) total += tx.amount;
            else if(tx.type === 'taken' && tx.status === 'pending' && tx.isDeleted===false) total -= tx.amount;
        });
        return total;
    }

    const balance = calculateBalance();
    const balanceColor = balance < 0 ? 'text-red-600 dark:text-red-400' : balance > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400';
    const balanceText = balance !== 0 ? `₹${Math.abs(balance)}` : 'Settled';

    const handleDeleteFriend = async () => {
        const token = localStorage.getItem('token');
        try{
            const response = await fetch(`${API_BASE_URL}/friends/${friend.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(response.ok){
                onClose2();
            }
        } catch (error) {
            console.error("Error in deleting friend : ", error);
        }

    }

    return (
        <>
            <div className="fixed inset-0 z-10 bg-white dark:bg-gray-900 flex flex-col items-center justify-center" style={{ top: '64px' }}>
                <div className="w-full shadow-xl max-w-xl h-full flex flex-col">
                    
                    {}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 text-xl"
                            >
                                ←
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{friend.friendName}</h2>
                                <p className={`text-sm font-medium ${balanceColor}`}>{balanceText}</p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="flex-1 p-2 overflow-y-auto scrollbar-hide space-y-2">
                        {sortedTransactions.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No active transactions with {friend.friendName}
                            </p>
                        ) : (
                            <>
                                {sortedTransactions.map(tx => (
                                    <TransactionItem
                                        key={tx.id}
                                        transaction={tx}
                                        onToggle={toggleStatus}
                                        onDelete={deleteTransaction}
                                        onDeleteClick={() => {
                                            setTransactionToDelete(tx);
                                            setShowDeleteConfirm(true);
                                        }}
                                        onEditClick={handleEditClick}
                                    />
                                ))}
                                <div ref={bottomRef} />
                            </>
                        )}
                    </div>

                    {}
                    <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3 pb-2 bg-white dark:bg-gray-900">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex-1 min-w-[80px] py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                            >
                                ➕ Add 
                            </button>
                            <button
                                onClick={handleSettleAll}
                                disabled={pendingCount === 0}
                                className={`flex-1 min-w-[80px] py-2.5 text-white text-sm font-medium rounded-xl transition-colors ${
                                    pendingCount > 0
                                        ? 'bg-indigo-600 hover:bg-indigo-700'
                                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                }`}
                            >
                                💸 Settle {pendingCount > 0 && `(${pendingCount})`}
                            </button>
                            <button
                                onClick={() => {
                                    setFriendToDelete(friend);
                                    setShowDeleteFriendConfirm(true);
                                }}
                                className="flex-1 min-w-[80px] py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
                            >
                                🗑️ Friend
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {}
            {showAddModal && (
                <AddExpenseModal
                    friend={friend}
                    onClose={() => setShowAddModal(false)}
                    onAddExpense={handleAddExpense}
                />
            )}

            {}
            {showEditModal && editingTransaction && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">✏️ Edit Transaction</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveEdit({
                                ...editingTransaction,
                                amount: parseFloat(e.target.amount.value),
                                reason: e.target.reason.value,
                            });
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                                <input type="number" name="amount" defaultValue={editingTransaction.amount} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                                <input type="text" name="reason" defaultValue={editingTransaction.reason} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setShowEditModal(false); setEditingTransaction(null); }} className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">💾 Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {}
            <DeleteConfirmation
                isOpen={showDeleteConfirm}
                onClose={() => { setShowDeleteConfirm(false); setTransactionToDelete(null); }}
                onConfirm={handleDeleteTransaction}
                title="Delete Transaction?"
                message={`Are you sure you want to delete "${transactionToDelete?.reason || 'this transaction'}"?`}
                confirmText="Delete"
                type="danger"
            />

            <DeleteConfirmation
                isOpen={showDeleteFriendConfirm}
                onClose={() => { setShowDeleteFriendConfirm(false); setFriendToDelete(null); }}
                onConfirm={handleDeleteFriend}
                title={`Delete ${friendToDelete?.name || 'Friend'}?`}
                message="This friend will be removed from Home."
                confirmText="Delete"
                type="danger"
            />
        </>
    );
};

const TransactionItem = ({ transaction, onToggle, onDeleteClick, onEditClick }) => {
    const isGiven = transaction.type === 'given';
    const isPending = transaction.status === 'pending';
    const isDeleted = transaction.isDeleted || false;

    const formatDate = (dateStr) => {
        if(!dateStr) return 'Invalid Date';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Invalid Date';
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
            ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex ${isGiven ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative w-[50%]  min-h-[100px] rounded-xl p-3 transition-all ${
                isPending 
                    ? 'bg-gray-200 dark:bg-gray-600 border-l-4 ' + (isGiven ? 'border-green-500 dark:border-green-400' : 'border-red-500 dark:border-red-400')
                    : 'bg-gray-50 dark:bg-gray-600/30 border-l-4 border-gray-200 dark:border-gray-700'
            } ${isDeleted ? 'opacity-40 grayscale' : ''}`}>
                
                {}
                {!isDeleted && (
                    <button
                        onClick={onDeleteClick}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-300/50 hover:bg-red-100 text-gray-400 dark:text-white hover:text-red-500 text-xs flex items-center justify-center transition-colors shadow-sm"
                    >
                        ✕
                    </button>
                )}

                {}
                <p className={`font-medium text-sm ${isPending ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {transaction.reason}
                </p>

                {}
                <div className="flex justify-between items-center mt-1">
                    <p className={`text-xs ${isPending ? 'text-gray-400 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
                        {formatDate(transaction.transactionDate)}
                    </p>
                    <p className={`text-base font-bold ${
                        isGiven
                            ? isPending ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                            : isPending ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                        ₹{transaction.amount}
                    </p>
                </div>

                {}
                <div className="flex items-center justify-between mt-2">
                    <button
                        onClick={() => onToggle(transaction.id)}
                        className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full transition-colors ${
                            isPending
                                ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/30 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}
                    >
                        {isPending ? '⏳ Pending' : '✅ Settled'}
                    </button>

                    {isPending && !isDeleted && (
                        <button
                            onClick={() => onEditClick(transaction)}
                            className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/30 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors"
                        >
                            ✏️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendDataOverlay;