import { useState } from 'react';
import SummaryCard from '../components/SummaryCard';
import SearchBar from '../components/SearchBar';
import SettlementModal from '../components/SettlementModal';
import FriendList, { friendsData } from '../components/FriendList';

const Home = ({ refreshKey, onlineUsers }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettlement, setShowSettlement] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleDataChange = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
            
            {}
            <SummaryCard key={refreshTrigger} />
            
            <div className="mt-4 flex-shrink-0">
                <SearchBar 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </div>

            <div className="mt-3 flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                <FriendList 
                    key={refreshKey} 
                    searchQuery={searchQuery}
                    onlineUsers={onlineUsers}
                    onDataChange={handleDataChange}
                />
            </div>

            <div className="mt-3 flex-shrink-0 pb-2">
                <button 
                    onClick={() => setShowSettlement(true)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                    🤝 Smart Settlement
                </button>
            </div>

            {showSettlement && (
                <SettlementModal 
                    friends={friendsData}
                    onClose={() => setShowSettlement(false)}
                />
            )}
        </div>
    );
};

export default Home;