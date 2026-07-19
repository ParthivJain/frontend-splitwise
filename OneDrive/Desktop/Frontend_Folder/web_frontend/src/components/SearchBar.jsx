const SearchBar = ({value, onChange}) => {
    return(
        <div className="relative">
            <input
                type="text"
                placeholder="🔍 Search friends..."
                value={value}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ooutline-none transition-all"
                />
        </div>
    );
};

export default SearchBar;