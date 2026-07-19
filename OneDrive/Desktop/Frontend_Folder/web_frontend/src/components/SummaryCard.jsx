import { useState, useEffect } from "react";
import { friendsData } from "./FriendList";

const SummaryCard = ({ title = 'Summary' }) => {
    const [given, setGiven] = useState(0);
    const [taken, setTaken] = useState(0);
    const [net, setNet] = useState(0);

    const fetchSummary = () => {
        let totalGiven = 0;
        let totalTaken = 0;

        const activeFriends = friendsData.filter(f => f.status === 'active');

        activeFriends.forEach(friend => {
            if (friend.balance > 0) {
                totalGiven += friend.balance;
            } else {
                totalTaken += Math.abs(friend.balance);
            }
        });

        const totalNet = totalGiven - totalTaken;

        setGiven(totalGiven);
        setTaken(totalTaken);
        setNet(totalNet);
    };

    useEffect(() => {
        fetchSummary();
    }, []); // ✅ Initial load

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {title}
            </h3>
            <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">You Given</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        ₹{given}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">You Taken</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        ₹{taken}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Net</p>
                    <p className={`text-xl font-bold ${
                        net >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                        ₹{Math.abs(net)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;