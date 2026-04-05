export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          brand: string;
          model: string;
          year: number;
          battery_percentage: number;
          latitude: number;
          longitude: number;
          vin: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brand: string;
          model: string;
          year: number;
          battery_percentage?: number;
          latitude: number;
          longitude: number;
          vin?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brand?: string;
          model?: string;
          year?: number;
          battery_percentage?: number;
          latitude?: number;
          longitude?: number;
          vin?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      battery_history: {
        Row: {
          id: string;
          vehicle_id: string;
          battery_percentage: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          battery_percentage: number;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          battery_percentage?: number;
          recorded_at?: string;
        };
      };
      charging_stations: {
        Row: {
          id: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          charger_type: string;
          available_ports: number;
          total_ports: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          charger_type: string;
          available_ports?: number;
          total_ports: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          charger_type?: string;
          available_ports?: number;
          total_ports?: number;
          created_at?: string;
        };
      };
    };
  };
}
