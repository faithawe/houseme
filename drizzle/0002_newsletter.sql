CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
