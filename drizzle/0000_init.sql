-- HouseMe initial schema
-- Rollback: DROP TABLE contact_events, listing_audit_log, favorites, listing_photos,
--           listings, landlord_profiles, password_reset_tokens, email_verification_tokens, users
--           CASCADE; DROP TYPE user_role, listing_status, property_type, price_period, audit_action;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'admin');
CREATE TYPE listing_status AS ENUM ('pending_review', 'live', 'rejected', 'soft_deleted');
CREATE TYPE property_type AS ENUM ('self_con', 'room', 'flat', 'mini_flat', 'bungalow', 'duplex');
CREATE TYPE price_period AS ENUM ('monthly', 'yearly');
CREATE TYPE audit_action AS ENUM ('approved', 'rejected', 'flagged', 'soft_deleted');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role user_role NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  failed_login_attempts SMALLINT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_users_email ON users (email);

CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE landlord_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(150),
  verified BOOLEAN NOT NULL DEFAULT false,
  bio TEXT
);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  property_type property_type NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  price_period price_period NOT NULL,
  city VARCHAR(100) NOT NULL,
  area VARCHAR(100),
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  bedrooms SMALLINT NOT NULL,
  bathrooms SMALLINT NOT NULL,
  furnished BOOLEAN NOT NULL DEFAULT false,
  amenities TEXT[],
  status listing_status NOT NULL DEFAULT 'pending_review',
  rejection_reason TEXT,
  contact_clicks BIGINT NOT NULL DEFAULT 0,
  view_count BIGINT NOT NULL DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT check_price_positive CHECK (price > 0),
  CONSTRAINT check_bedrooms_non_negative CHECK (bedrooms >= 0),
  CONSTRAINT check_bathrooms_non_negative CHECK (bathrooms >= 0),
  CONSTRAINT check_description_length CHECK (
    char_length(description) >= 50 AND char_length(description) <= 2000
  )
);

CREATE INDEX idx_listings_status ON listings (status);
CREATE INDEX idx_listings_city ON listings (city);
CREATE INDEX idx_listings_price ON listings (price);
CREATE INDEX idx_listings_type ON listings (property_type);
CREATE INDEX idx_listings_composite ON listings (status, city, price, property_type);
CREATE INDEX idx_listings_landlord ON listings (landlord_id);
CREATE INDEX idx_listings_created ON listings (created_at);
CREATE INDEX idx_listings_pending ON listings (created_at)
  WHERE status = 'pending_review';

CREATE TABLE listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_listing ON listing_photos (listing_id);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_listing UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites (user_id);

CREATE TABLE listing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  admin_id UUID NOT NULL REFERENCES users(id),
  action audit_action NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_listing ON listing_audit_log (listing_id);
CREATE INDEX idx_audit_admin ON listing_audit_log (admin_id);
CREATE INDEX idx_audit_created ON listing_audit_log (created_at);

CREATE TABLE contact_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  user_id UUID,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_listing ON contact_events (listing_id);

-- Full-text search vector + GIN index
CREATE INDEX idx_listings_search ON listings USING GIN (search_vector);

CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.area, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listing_search_vector
  BEFORE INSERT OR UPDATE OF title, description, area, city
  ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_search_vector();
