"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./CTADatePicker.module.css";

interface CTADatePickerProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  isDark?: boolean;
  width?: string;
}

export default function CTADatePicker({
  selectedDate,
  onSelectDate,
  isDark = true,
  width = "100%",
}: CTADatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected date or fallback to today
  const currentDateObj = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth());

  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate days for the grid
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalDaysPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const days = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = totalDaysPrevMonth - i;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const formattedDate = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    days.push({ dayNum, formattedDate, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const formattedDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dayNum: i, formattedDate, isCurrentMonth: true });
  }

  // Next month leading days to complete grid (42 cells total for 6 rows)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const formattedDate = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dayNum: i, formattedDate, isCurrentMonth: false });
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Format date for display in input header (DD-MM-YYYY)
  const displayFormattedDate = selectedDate 
    ? selectedDate.split("-").reverse().join("-") 
    : "Select Date";

  return (
    <div className={styles.datePickerContainer} style={{ width }} ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={isDark ? styles.pickerHeaderDark : styles.pickerHeaderLight}
      >
        <span>{displayFormattedDate}</span>
        <CalendarIcon size={16} className="text-emerald-400" />
      </div>

      {isOpen && (
        <div className={isDark ? styles.calendarPopupDark : styles.calendarPopupLight}>
          {/* Month & Year Switcher Header */}
          <div className={styles.calendarNav}>
            <button type="button" onClick={handlePrevMonth} className={styles.navBtn}>
              <ChevronLeft size={16} />
            </button>
            <span className={styles.monthYearTitle}>
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={handleNextMonth} className={styles.navBtn}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekdays Header */}
          <div className={styles.weekdaysGrid}>
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className={styles.daysGrid}>
            {days.map((d, index) => {
              const isSelected = selectedDate === d.formattedDate;
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => {
                    onSelectDate(d.formattedDate);
                    setIsOpen(false);
                  }}
                  className={`${styles.dayCell} ${!d.isCurrentMonth ? styles.dimDay : ""} ${
                    isSelected ? styles.selectedDay : ""
                  }`}
                >
                  {d.dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}