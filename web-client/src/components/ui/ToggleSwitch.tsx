import React from "react";
import toggleStyles from "./ToggleSwitch.module.css";

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    labels: [string, string]; // [leftLabel, rightLabel]
}

export const ToggleSwitch = ({ checked, onChange, labels }: ToggleSwitchProps) => {
    return (
        <div className={toggleStyles.toggleSwitch}>
            <label className={toggleStyles.switch}>
                <input type="checkbox" checked={checked} onChange={onChange} />
                <span className={`${toggleStyles.slider} ${toggleStyles.round}`}></span>
            </label>
            <div className={toggleStyles.labels}>
                <span className={checked ? toggleStyles.inactiveLabel : toggleStyles.activeLabel}>
                    {labels[0]}
                </span>
                <span className={checked ? toggleStyles.activeLabel : toggleStyles.inactiveLabel}>
                    {labels[1]}
                </span>
            </div>
        </div>
    );
};
