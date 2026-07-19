import { useState } from 'react';
import API_BASE_URL from '../utils/api';

const AddExpenseModal = ({ friend, onClose, onAddExpense }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if(!amount || !reason){
            alert('Please fill all fields');
            setLoading(false);
            return;
        }
        
        const token = localStorage.getItem('token');
        try{
            const response = await fetch(`${API_BASE_URL}/transactions`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}`
                },
                body: JSON.stringify({
                    friendId: friend.friendId,
                    amount: parseFloat(amount),
                    reason: reason,
                    type: type
                })
            });
            if(response.ok){
                const data = await response.json();
                onAddExpense(data);
                onClose();
            } else {
                const errorText = await response.text();
                setError(errorText || 'Failed to add expense');
            }
        } catch (error){
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }

    };

    return(
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
                        ➕ Add Expense
                    </h2>
                    <button 
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
                        ✕
                    </button>
                </div>
                
                {}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">

                    {}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Friend
                        </label>
                        <input
                            type="text"
                            value={friend.friendName}
                            disabled
                            className='w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        />
                    </div>

                    {}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount (₹)  
                        </label>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder='Enter Amount'
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    {}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason
                        </label>
                        <input
                            type='text'
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder='What for?'
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    {}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Transaction Type
                        </label>
                        <div className="flex gap-3">
                            <button
                            type='button'
                            onClick={() => setType('given')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            type === 'given' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}>
                                📤 Given
                            </button>
                            <button
                                type='button'
                                onClick={() => setType('taken')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                type === 'taken' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}>
                                📥 Taken
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type='button'
                            onClick={onClose}
                            className="flex-1 py-2 bg-gray-400 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                        >
                            Cancle
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            ➕ Add Expense
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );

};

export default AddExpenseModal;