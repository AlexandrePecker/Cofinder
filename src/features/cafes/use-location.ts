import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

type LocationState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'ready'; lat: number; lng: number };

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({ status: 'loading' });

  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== 'granted') {
          setState({ status: 'denied' });
          return;
        }
        return Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }).then(({ coords }) =>
          setState({ status: 'ready', lat: coords.latitude, lng: coords.longitude }),
        );
      })
      .catch(() => setState({ status: 'denied' }));
  }, []);

  return state;
}
