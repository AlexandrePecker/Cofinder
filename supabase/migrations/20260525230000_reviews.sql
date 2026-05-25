CREATE TABLE reviews (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  place_id   text REFERENCES cafes(place_id) ON DELETE CASCADE NOT NULL,
  rating     integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, place_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_read" ON reviews
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update" ON reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete" ON reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
