/**
 * @file TimeInput.jsx
 * @description Custom time input component with separate hour and minute fields
 * Displays time as "hh mm AM/PM" format with 15-minute interval controls
 */

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

/**
 * TimeInput Component
 * Displays time as three separate inputs: Hour (1-12), Minute (00/15/30/45), AM/PM
 * Only allows valid times between 7am-10pm with 15-minute intervals
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - Selected time in "HH:MM" format (24-hour)
 * @param {Function} props.onChange - Callback when time changes
 * @param {boolean} [props.disabled=false] - Disable the input
 * @returns {JSX.Element}
 */
const TimeInput = ({ value, onChange, disabled = false }) => {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState("AM");

  // Initialize component when value changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      const hourInt = parseInt(h);
      
      // Convert 24-hour to 12-hour format
      let displayHour = hourInt;
      let displayPeriod = "AM";
      
      if (hourInt >= 12) {
        displayPeriod = "PM";
        displayHour = hourInt > 12 ? hourInt - 12 : 12;
      } else if (hourInt === 0) {
        displayHour = 12;
      }
      
      setHour(String(displayHour));
      setMinute(m);
      setPeriod(displayPeriod);
    }
  }, [value]);

  const handleHourChange = (e) => {
    const newHour = e.target.value;
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  const handleMinuteChange = (e) => {
    const newMinute = e.target.value;
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    updateTime(hour, minute, newPeriod);
  };

  const updateTime = (h, m, p) => {
    if (!h || !m) return;

    let hour24 = parseInt(h);
    if (p === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (p === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    const timeString = `${String(hour24).padStart(2, "0")}:${m}`;
    onChange(timeString);
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // Valid minutes: 00, 15, 30, 45
  const minuteOptions = ["00", "15", "30", "45"];

  return (
    <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
      <Clock size={18} className="text-gray-500 flex-shrink-0" />
      
      {/* Hour Input */}
      <select
        value={hour}
        onChange={handleHourChange}
        disabled={disabled}
        className="w-14 outline-none text-sm bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center font-medium"
      >
        <option value="">--</option>
        {hourOptions.map((h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, "0")}
          </option>
        ))}
      </select>

      {/* Colon Separator */}
      <span className="text-lg font-semibold text-gray-400">:</span>

      {/* Minute Input */}
      <select
        value={minute}
        onChange={handleMinuteChange}
        disabled={disabled}
        className="w-14 outline-none text-sm bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center font-medium"
      >
        <option value="">--</option>
        {minuteOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {/* Period (AM/PM) */}
      <select
        value={period}
        onChange={handlePeriodChange}
        disabled={disabled}
        className="w-16 outline-none text-sm bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center font-medium"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default TimeInput;
