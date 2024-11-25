import React from "react";

interface ActionButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

export const ActionButton = ({
    onClick,
    children,
    disabled = false,
    className = "",
}: ActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: "10px 20px",
                margin: "10px",
                backgroundColor: disabled ? "#ccc" : "#0070f3",
                color: "#fff",
                cursor: disabled ? "not-allowed" : "pointer",
            }}
            className={className}
        >
            {children}
        </button>
    );
};

export const ActionButton2 = ({
    onClick,
    children,
    disabled = false,
    className = "",
}: ActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: "10px 20px",
                margin: "10px",
                color: disabled ? "#d3d3d3" : "#333333",
                cursor: disabled ? "not-allowed" : "pointer",
            }}
            className={className}
        >
            {children}
        </button>
    );
};
