import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  // Mock availability data
  const getDayStatus = (day) => {
    const dayOfWeek = format(day, 'EEEE');
    const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const isAvailable = availableDays.includes(dayOfWeek);
    
    if (!isAvailable) return 'unavailable';
    if (Math.random() > 0.3) return 'available';
    return 'booked';
  };

  const getDayClass = (day) => {
    if (!isSameMonth(day, currentDate)) return 'text-gray-300';
    
    const status = getDayStatus(day);
    if (isSameDay(day, selectedDate)) {
      return 'bg-primary-600 text-white rounded-full';
    }
    switch (status) {
      case 'available':
        return 'hover:bg-primary-50 cursor-pointer';
      case 'booked':
        return 'text-gray-400 cursor-not-allowed';
      default:
        return 'text-gray-300 cursor-not-allowed';
    }
  };

  const getDayIndicator = (day) => {
    if (!isSameMonth(day, currentDate)) return null;
    const status = getDayStatus(day);
    if (status === 'available' && !isSameDay(day, selectedDate)) {
      return <span className="block w-1 h-1 bg-green-500 rounded-full mx-auto mt-0.5"></span>;
    }
    if (status === 'booked') {
      return <span className="block w-1 h-1 bg-red-500 rounded-full mx-auto mt-0.5"></span>;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day) => {
          const dayStatus = getDayStatus(day);
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => dayStatus === 'available' && handleDateClick(day)}
              className={`
                relative aspect-square flex items-center justify-center text-sm
                transition-all duration-200
                ${getDayClass(day)}
                ${isSelected ? 'scale-105 shadow-soft' : ''}
              `}
            >
              <span>{format(day, 'd')}</span>
              {getDayIndicator(day)}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-xs text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-xs text-gray-500">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          <span className="text-xs text-gray-500">Unavailable</span>
        </div>
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
          <p className="text-sm text-primary-700">
            Selected: <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong>
            <span className="block text-xs text-primary-600 mt-0.5">Available for bookings</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Calendar;