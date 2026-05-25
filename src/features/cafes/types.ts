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
