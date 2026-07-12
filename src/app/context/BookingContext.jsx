import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

const initial = {
  checkIn: null, checkOut: null, guests: 1,
  selectedRooms: [],
  customerInfo: { fullName: '', document: '', email: '', phone: '' },
  paymentInfo: { cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' },
  confirmationCode: null, totalPrice: 0,
};

export function BookingProvider({ children }) {
  const [bookingData, setBookingData] = useState(initial);
  const updateBookingData = (data) => setBookingData(prev => ({ ...prev, ...data }));
  const resetBooking = () => setBookingData(initial);

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    return Math.ceil((bookingData.checkOut - bookingData.checkIn) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return bookingData.selectedRooms.reduce((sum, { room, quantity }) => sum + room.precio * quantity * nights, 0);
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, resetBooking, calculateNights, calculateTotal }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
