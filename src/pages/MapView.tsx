import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { Battery, MapPin } from 'lucide-react';
import L from 'leaflet';
import type { Database } from '../lib/database.types';
import 'leaflet/dist/leaflet.css';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type ChargingStation = Database['public']['Tables']['charging_stations']['Row'];

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function MapView() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([37.7749, -122.4194]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    getUserLocation();

    const channel = supabase
      .channel('vehicles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log('Could not get user location');
        }
      );
    }
  };

  const fetchData = async () => {
    try {
      const [vehiclesResponse, stationsResponse] = await Promise.all([
        supabase.from('vehicles').select('*'),
        supabase.from('charging_stations').select('*'),
      ]);

      if (vehiclesResponse.error) throw vehiclesResponse.error;
      if (stationsResponse.error) throw stationsResponse.error;

      setVehicles(vehiclesResponse.data || []);
      setStations(stationsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const vehicleIcon = useMemo(
    () =>
      L.divIcon({
        html: `
        <div style="background: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M5 17h14v-5H5v5zm0 0v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2H5zm10 0v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h-4z"/>
            <path d="M5 12V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/>
          </svg>
        </div>
      `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    []
  );

  const stationIcon = useMemo(
    () =>
      L.divIcon({
        html: `
        <div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
      `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    []
  );

  const userIcon = useMemo(
    () =>
      L.divIcon({
        html: `
        <div style="background: #ef4444; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
      `,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Live Map</h1>
          <p className="text-gray-600 mt-1">Track your vehicles and find charging stations</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-[600px] relative">
            <MapContainer
              center={userLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={userLocation} />

              <Marker position={userLocation} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>Your Location</strong>
                  </div>
                </Popup>
              </Marker>

              {vehicles.map((vehicle) => (
                <Marker
                  key={vehicle.id}
                  position={[vehicle.latitude, vehicle.longitude]}
                  icon={vehicleIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-lg mb-2">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Battery className="w-4 h-4" />
                          <span>Battery: {vehicle.battery_percentage}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                          </span>
                        </div>
                        {vehicle.color && (
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: vehicle.color }}
                            />
                            <span className="capitalize">{vehicle.color}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {stations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.latitude, station.longitude]}
                  icon={stationIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-lg mb-2">{station.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">{station.address}</p>
                        <p>
                          <strong>Type:</strong> {station.charger_type}
                        </p>
                        <p>
                          <strong>Available:</strong> {station.available_ports}/{station.total_ports} ports
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="p-4 bg-gray-50 border-t grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              <span>Vehicles ({vehicles.length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
              <span>Charging Stations ({stations.length})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
