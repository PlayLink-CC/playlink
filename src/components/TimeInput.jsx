/**
 * @file TimeInput.jsx
 * @description Custom time input component with separate hour and minute fields
 * Displays time as "hh mm AM/PM" format with 15-minute interval controls
 */

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

/**
 * TimeInput.jsx
 * Custom time input component with separate hour and minute fields
 * Displays time as "hh mm AM/PM" format with 15-minute interval controls
 */

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
const TimeInput = ({ value, onChange, disabled = false, minTime = null }) => {
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

  // Generate hour options depending on period to enforce 07:00-21:45 start window
  const getHourOptionsForPeriod = (p) => {
    if (p === "AM") {
      // Allowed AM display hours: 7,8,9,10,11
      return [7, 8, 9, 10, 11];
    }
    // PM display hours: 12 (noon), 1..9 (i.e. 12pm..9pm)
    return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  };

  const hourOptions = getHourOptionsForPeriod(period);

  // Valid minutes: 00, 15, 30, 45
  const minuteOptions = ["00", "15", "30", "45"];

  // If the period changes and the currently selected hour is no longer valid, clear hour
  useEffect(() => {
    if (!hour) return;
    const hNum = Number(hour);
    if (!hourOptions.includes(hNum)) {
      setHour("");
    }
  }, [period]);

  // Helper to check if a full time (hour, minute, period) is >= minTime
  const isTimeBeforeMin = (hDisplay, m, p) => {
    if (!minTime) return false;
    const [minH, minM] = minTime.split(":").map(Number);
    // Convert display hour to 24h
    let h24 = Number(hDisplay);
    if (p === "PM" && h24 !== 12) h24 += 12;
    if (p === "AM" && h24 === 12) h24 = 0;
    const total = h24 * 60 + Number(m);
    const minTotal = minH * 60 + minM;
    return total < minTotal;
  };

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
        {hourOptions.map((h) => {
          // determine if any minute option for this hour would be allowed (not before minTime)
          const anyAllowed = minuteOptions.some((m) => !isTimeBeforeMin(h, m, period));
          return (
            <option key={h} value={h} disabled={!anyAllowed}>
              {String(h).padStart(2, "0")}
            </option>
          );
        })}
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
          <option key={m} value={m} disabled={isTimeBeforeMin(hour || 0, m, period)}>
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
