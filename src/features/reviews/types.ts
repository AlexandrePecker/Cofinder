export interface Review {
  id: string;
  user_id: string;
  place_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
