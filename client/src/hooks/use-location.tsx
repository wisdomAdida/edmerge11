import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getUserLocationInfo, isCountrySupported } from "@/lib/utils";

type LocationContextType = {
  isLoading: boolean;
  countryCode: string;
  currencyCode: string;
  isSupported: boolean;
};

const LocationContext = createContext<LocationContextType>({
  isLoading: true,
  countryCode: 'NG',
  currencyCode: 'NGN',
  isSupported: true
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationData, setLocationData] = useState<{
    isLoading: boolean;
    countryCode: string;
    currencyCode: string;
    isSupported: boolean;
  }>({
    isLoading: true,
    countryCode: 'NG',
    currencyCode: 'NGN',
    isSupported: true
  });

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const { countryCode, currencyCode, isSupported } = await getUserLocationInfo();
        
        setLocationData({
          isLoading: false,
          countryCode,
          currencyCode,
          isSupported
        });
        
        // Store location data in localStorage for persistence across page refreshes
        localStorage.setItem('edmerge_user_location', JSON.stringify({
          countryCode,
          currencyCode,
          isSupported
        }));
      } catch (error) {
        console.error('Failed to fetch location data:', error);
        
        // If fetching fails, try to get data from localStorage
        const storedData = localStorage.getItem('edmerge_user_location');
        if (storedData) {
          try {
            const { countryCode, currencyCode, isSupported } = JSON.parse(storedData);
            setLocationData({
              isLoading: false,
              countryCode,
              currencyCode,
              isSupported
            });
          } catch {
            // If localStorage data is invalid, use defaults
            setLocationData({
              isLoading: false,
              countryCode: 'NG',
              currencyCode: 'NGN',
              isSupported: true
            });
          }
        } else {
          // If no localStorage data, use defaults
          setLocationData({
            isLoading: false,
            countryCode: 'NG',
            currencyCode: 'NGN',
            isSupported: true
          });
        }
      }
    };

    fetchLocationData();
  }, []);

  return (
    <LocationContext.Provider value={locationData}>
      {children}
    </LocationContext.Provider>
  );
}

export function useGeoLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useGeoLocation must be used within a LocationProvider");
  }
  return context;
}

// Removed the useLocation alias to avoid conflicts with wouter's useLocation hook
// Always use useGeoLocation instead for geo-location functionality