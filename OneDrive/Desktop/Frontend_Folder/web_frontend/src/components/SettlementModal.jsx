import { useState } from 'react';
import API_BASE_URL from '../utils/api';

const SettlementModal = ({ friends, onClose }) => {
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const token = localStorage.getItem('token');

    const getSuggestions = async () => {
        if (selectedFriends.length === 0) {
            alert('Please select at least one friend');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/settlement/suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    friendIds: selectedFriends.map(f => f.friendId)
                })
            });

            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error getting suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        🤝 Smart Settlement
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                {!showSuggestions ? (
                    <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Select friends to settle with (You are automatically included)
                        </p>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {friends.map(friend => {
                                const isSelected = selectedFriends.some(f => f.id === friend.id);
                                return (
                                    <label 
                                        key={friend.id} 
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                            isSelected 
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500' 
                                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                                if (isSelected) {
                                                    setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
                                                } else {
                                                    setSelectedFriends([...selectedFriends, friend]);
                                                }
                                            }}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {friend.friendName}
                                            </p>
                                            <p className={`text-sm ${
                                                friend.balance > 0 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : friend.balance < 0
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {friend.balance > 0 
                                                    ? `Gets ₹${friend.balance}` 
                                                    : friend.balance < 0
                                                        ? `Owes ₹${Math.abs(friend.balance)}`
                                                        : 'Settled'}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={getSuggestions}
                                disabled={selectedFriends.length === 0 || loading}
                                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                                    selectedFriends.length === 0 || loading
                                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                            >
                                {loading ? 'Calculating...' : '💡 Get Suggestions'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>

                        {suggestions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-4xl mb-3">🎉</p>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    All settled!
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No transactions needed
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {suggestions.length} transaction{suggestions.length > 1 ? 's' : ''} suggested
                                </p>
                                
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {suggestions.map((suggestion, index) => (
                                        <div 
                                            key={index}
                                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {suggestion.fromUserName}
                                                </span>
                                                <span className="text-gray-500">→</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {suggestion.toUserName}
                                                </span>
                                            </div>
                                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                ₹{suggestion.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        ✅ Done
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SettlementModal;