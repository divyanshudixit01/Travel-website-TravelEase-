import { createContext, useState } from 'react';

const TravelContext = createContext();

export const TravelProvider = ({ children }) => {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    type: '',
    budget: '',
    duration: '',
  });

  const updateSearchFilters = (newFilters) => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
  };

  const selectDestination = (destination) => {
    setSelectedDestination(destination);
  };

  const saveBookingDetails = (details) => {
    setBookingDetails(details);
  };

  return (
    <TravelContext.Provider
      value={{
        selectedDestination,
        bookingDetails,
        searchFilters,
        selectDestination,
        saveBookingDetails,
        updateSearchFilters,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};

export default TravelContext;