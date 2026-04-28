-- PostgreSQL schema for Fitness Tracking App

-- Create ENUM types
CREATE TYPE activity_intensity AS ENUM ('low', 'medium', 'high');
CREATE TYPE reaction_target_type AS ENUM ('activity', 'comment');

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  administrator BOOLEAN NOT NULL DEFAULT false,
  profile_picture VARCHAR(255),
  bio TEXT,
  reactions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_elapsed INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  intensity activity_intensity NOT NULL,
  distance NUMERIC(10, 2),
  weight NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Friendships table
CREATE TABLE friendships (
  id SERIAL PRIMARY KEY,
  user_a_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT different_users CHECK (user_a_id != user_b_id),
  UNIQUE(user_a_id, user_b_id)
);

-- Comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Reactions table
CREATE TABLE reactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type reaction_target_type NOT NULL,
  target_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for reactions based on target_type
-- Note: This requires a more complex check; consider adding triggers if needed

-- Create indexes for common queries
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_comments_activity_id ON comments(activity_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX idx_friendships_users ON friendships(user_a_id, user_b_id);
