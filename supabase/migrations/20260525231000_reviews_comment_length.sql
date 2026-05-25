ALTER TABLE reviews
  ADD CONSTRAINT reviews_comment_length
  CHECK (comment IS NULL OR char_length(comment) <= 2000);
