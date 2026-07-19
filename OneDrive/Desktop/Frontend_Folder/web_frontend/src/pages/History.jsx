import { useState, useMemo } from 'react';
import FriendList from '../components/FriendList';
import SummaryCard from '../components/SummaryCard';

const History = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return now.toISOString().slice(0, 7);
    });

    const handleMonthChange = (month) => {
        setSelectedMonth(month);
    };

    const monthPendingTransactions = useMemo(() => {
        return [];
    }, [selectedMonth]);

    return (
        <div className="h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">

            <SummaryCard 
                transactions={monthPendingTransactions} 
                title={`Summary`}
            />

            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide mt-4">
                <FriendList 
                    showDeleted={true} 
                    isHistory={true}
                />
            </div>

        </div>
    );
};

export default History; 