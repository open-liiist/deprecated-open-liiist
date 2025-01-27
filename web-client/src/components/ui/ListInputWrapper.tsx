const ListInputWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex items-center bg-slate-100 h-20 mb-4 px-4 rounded-3xl">
            {children}
        </div>
    );
};