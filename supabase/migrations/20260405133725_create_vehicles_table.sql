/*
  # EV Fleet Management System - Database Schema

  ## Overview
  Creates the core database structure for the EV Fleet & Charging Management System.

  ## 1. New Tables
  
  ### `vehicles` table
  Stores electric vehicle information linked to authenticated users.
  
  - `id` (uuid, primary key) - Unique identifier for each vehicle
  - `user_id` (uuid, foreign key) - References auth.users, links vehicle to owner
  - `brand` (text) - Vehicle manufacturer (e.g., Tesla, Nissan)
  - `model` (text) - Vehicle model name
  - `year` (integer) - Manufacturing year
  - `battery_percentage` (integer) - Current battery level (0-100)
  - `latitude` (double precision) - Current vehicle latitude
  - `longitude` (double precision) - Current vehicle longitude
  - `vin` (text, optional) - Vehicle Identification Number
  - `color` (text, optional) - Vehicle color
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `battery_history` table
  Tracks battery level changes over time for analytics.
  
  - `id` (uuid, primary key) - Unique identifier
  - `vehicle_id` (uuid, foreign key) - References vehicles table
  - `battery_percentage` (integer) - Battery level at this point
  - `recorded_at` (timestamptz) - When this reading was taken

  ### `charging_stations` table
  Stores EV charging station locations and information.
  
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Charging station name
  - `address` (text) - Physical address
  - `latitude` (double precision) - Station latitude
  - `longitude` (double precision) - Station longitude
  - `charger_type` (text) - Type of charger (Level 2, DC Fast, etc.)
  - `available_ports` (integer) - Number of available charging ports
  - `total_ports` (integer) - Total charging ports
  - `created_at` (timestamptz) - Record creation timestamp

  ## 2. Security
  
  Implements Row Level Security (RLS) on all tables:
  
  ### Vehicles Table
  - Users can only view their own vehicles
  - Users can only create vehicles for themselves
  - Users can only update their own vehicles
  - Users can only delete their own vehicles
  
  ### Battery History Table
  - Users can view history for their own vehicles
  - Users can insert history for their own vehicles
  
  ### Charging Stations Table
  - All authenticated users can view charging stations
  - Only authenticated users can create stations (for future admin features)

  ## 3. Important Notes
  
  - All tables use RLS for security
  - Foreign key constraints ensure data integrity
  - Timestamps track data changes
  - Indexes on user_id and vehicle_id for performance
*/

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  battery_percentage integer NOT NULL DEFAULT 100 CHECK (battery_percentage >= 0 AND battery_percentage <= 100),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  vin text,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create battery history table
CREATE TABLE IF NOT EXISTS battery_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  battery_percentage integer NOT NULL CHECK (battery_percentage >= 0 AND battery_percentage <= 100),
  recorded_at timestamptz DEFAULT now()
);

-- Create charging stations table
CREATE TABLE IF NOT EXISTS charging_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  charger_type text NOT NULL,
  available_ports integer NOT NULL DEFAULT 0,
  total_ports integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_battery_history_vehicle_id ON battery_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_battery_history_recorded_at ON battery_history(recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE charging_stations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicles table
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for battery_history table
CREATE POLICY "Users can view own vehicle battery history"
  ON battery_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = battery_history.vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own vehicle battery history"
  ON battery_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = battery_history.vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

-- RLS Policies for charging_stations table
CREATE POLICY "Authenticated users can view charging stations"
  ON charging_stations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create charging stations"
  ON charging_stations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on vehicles
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample charging stations
INSERT INTO charging_stations (name, address, latitude, longitude, charger_type, available_ports, total_ports)
VALUES
  ('Downtown EV Hub', '123 Main St, San Francisco, CA', 37.7749, -122.4194, 'DC Fast Charger', 4, 6),
  ('Bay Area Supercharger', '456 Market St, San Francisco, CA', 37.7849, -122.4094, 'Tesla Supercharger', 8, 10),
  ('Green Valley Station', '789 Oak Ave, San Francisco, CA', 37.7649, -122.4294, 'Level 2', 3, 4),
  ('Tech Park Charging', '321 Innovation Dr, San Francisco, CA', 37.7949, -122.3994, 'DC Fast Charger', 5, 8),
  ('Coastal EV Stop', '654 Beach Blvd, San Francisco, CA', 37.7549, -122.4394, 'Level 2', 2, 3)
ON CONFLICT DO NOTHING;
