// Google Places API (New) client. Runs server-side only so the API key never
// reaches the client. Normalizes responses into the shape stored in `public.cafes`.

const NEARBY_ENDPOINT = 'https://places.googleapis.com/v1/places:searchNearby';

const PRICE_LEVEL: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

export interface Cafe {
  place_id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  photo_ref: string | null;
}

interface PlacesNearbyResponse {
  places?: {
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    photos?: { name?: string }[];
  }[];
}

function normalize(place: NonNullable<PlacesNearbyResponse['places']>[number]): Cafe {
  return {
    place_id: place.id,
    name: place.displayName?.text ?? 'Unnamed cafe',
    address: place.formattedAddress ?? null,
    lat: place.location?.latitude ?? 0,
    lng: place.location?.longitude ?? 0,
    rating: place.rating ?? null,
    user_ratings_total: place.userRatingCount ?? null,
    price_level: place.priceLevel ? (PRICE_LEVEL[place.priceLevel] ?? null) : null,
    photo_ref: place.photos?.[0]?.name ?? null,
  };
}

export async function searchNearbyCafes(
  apiKey: string,
  lat: number,
  lng: number,
  radius: number,
): Promise<Cafe[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(NEARBY_ENDPOINT, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.rating',
          'places.userRatingCount',
          'places.priceLevel',
          'places.photos',
        ].join(','),
      },
      body: JSON.stringify({
        includedTypes: ['cafe'],
        maxResultCount: 20,
        rankPreference: 'POPULARITY',
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius },
        },
      }),
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Places API timeout');
    }
    throw err;
  }
  clearTimeout(timer);

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Places API error ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as PlacesNearbyResponse;
  return (data.places ?? []).map(normalize);
}
