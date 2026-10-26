import React, { useState, useMemo } from "react";
import "./ClothCalendar.css";

interface BookedRange {
  startDate: string;
  endDate: string;
}

interface ClothCalendarProps {
  bookedRanges?: BookedRange[];
  selectedStart: string | null;
  selectedEnd: string | null;
  onChange: (start: string | null, end: string | null) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function parseDate(s: string): Date {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

function isBooked(date: Date, ranges: BookedRange[]): boolean {
  return ranges.some((r) => {
    const s = parseDate(r.startDate.slice(0, 10));
    const e = parseDate(r.endDate.slice(0, 10));
    return isDateInRange(date, s, e);
  });
}

const ClothCalendar: React.FC<ClothCalendarProps> = ({
  bookedRanges = [],
  selectedStart,
  selectedEnd,
  onChange,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const selStart = selectedStart ? parseDate(selectedStart) : null;
  const selEnd = selectedEnd ? parseDate(selectedEnd) : null;
  const hoverD = hoverDate ? parseDate(hoverDate) : null;

  // Build calendar grid for current month
  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewYear, viewMonth, d));
    }
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (date: Date) => {
    const dateStr = toDateStr(date);

    // If no start selected yet, or both are selected → set start
    if (!selStart || (selStart && selEnd)) {
      onChange(dateStr, null);
      return;
    }

    // Start selected, no end yet
    if (selStart && !selEnd) {
      if (date < selStart) {
        // clicked before start → reset and use as new start
        onChange(dateStr, null);
      } else {
        // check no booked days in the range
        let hasBlockedInRange = false;
        const tempD = new Date(selStart);
        tempD.setDate(tempD.getDate() + 1);
        while (tempD <= date) {
          if (isBooked(tempD, bookedRanges)) { hasBlockedInRange = true; break; }
          tempD.setDate(tempD.getDate() + 1);
        }
        if (hasBlockedInRange) {
          // restart from clicked date
          onChange(dateStr, null);
        } else {
          onChange(selectedStart, dateStr);
        }
      }
    }
  };

  const getDayClass = (date: Date): string => {
    const dateStr = toDateStr(date);
    const isPast = date < today;
    const booked = isBooked(date, bookedRanges);

    if (isPast || booked) return "cal-day disabled" + (booked ? " booked" : "");

    const classes = ["cal-day"];

    const isStart = selStart && toDateStr(selStart) === dateStr;
    const isEnd = selEnd && toDateStr(selEnd) === dateStr;
    const isToday = toDateStr(date) === toDateStr(today);

    // Range fill: between start and (end or hover)
    const rangeEnd = selEnd || (selStart && !selEnd ? hoverD : null);
    const inRange =
      selStart && rangeEnd && date > selStart && date < rangeEnd;

    if (isStart) classes.push("start-date");
    if (isEnd) classes.push("end-date");
    if (inRange) classes.push("in-range");
    if (isToday && !isStart && !isEnd) classes.push("today");

    return classes.join(" ");
  };

  // Legend counts
  const bookedCount = useMemo(() => {
    let count = 0;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      if (isBooked(date, bookedRanges)) count++;
    }
    return count;
  }, [viewYear, viewMonth, bookedRanges]);

  return (
    <div className="cloth-calendar">
      {/* Header */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">
          ‹
        </button>
        <div className="cal-title">
          <span className="cal-month">{MONTHS[viewMonth]}</span>
          <span className="cal-year">{viewYear}</span>
        </div>
        <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">
          ›
        </button>
      </div>

      {/* Selection hint */}
      <div className="cal-hint">
        {!selStart && <span>Click a date to set <strong>rental start</strong></span>}
        {selStart && !selEnd && <span>Now click to set <strong>return date</strong></span>}
        {selStart && selEnd && (
          <span className="cal-hint-done">
            ✓ {toDateStr(selStart)} → {toDateStr(selEnd)}
          </span>
        )}
      </div>

      {/* Day headers */}
      <div className="cal-days-header">
        {DAYS.map((d) => <span key={d}>{d}</span>)}
      </div>

      {/* Day cells */}
      <div className="cal-grid">
        {days.map((date, i) =>
          date === null ? (
            <span key={`empty-${i}`} className="cal-empty" />
          ) : (
            <button
              key={toDateStr(date)}
              className={getDayClass(date)}
              onClick={() => {
                if (date < today || isBooked(date, bookedRanges)) return;
                handleDayClick(date);
              }}
              onMouseEnter={() => {
                if (selStart && !selEnd) setHoverDate(toDateStr(date));
              }}
              onMouseLeave={() => setHoverDate(null)}
              disabled={date < today || isBooked(date, bookedRanges)}
              title={
                isBooked(date, bookedRanges) ? "Already booked" :
                date < today ? "Past date" : `Select ${toDateStr(date)}`
              }
            >
              <span className="day-num">{date.getDate()}</span>
              {isBooked(date, bookedRanges) && <span className="booked-dot" />}
            </button>
          )
        )}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="legend-item">
          <span className="legend-dot available" /> Available
        </span>
        <span className="legend-item">
          <span className="legend-dot booked-legend" /> Booked ({bookedCount} days)
        </span>
        <span className="legend-item">
          <span className="legend-dot selected-legend" /> Your selection
        </span>
      </div>
    </div>
  );
};

export default ClothCalendar;
