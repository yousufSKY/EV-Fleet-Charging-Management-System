import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Battery, Activity } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

export function Analytics() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase.from('vehicles').select('*');

      if (error) throw error;
      setVehicles(data || []);
      if (data && data.length > 0) {
        setSelectedVehicle(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const batteryHistoryData = [
    { date: 'Mon', battery: 95 },
    { date: 'Tue', battery: 88 },
    { date: 'Wed', battery: 82 },
    { date: 'Thu', battery: 75 },
    { date: 'Fri', battery: 68 },
    { date: 'Sat', battery: 92 },
    { date: 'Sun', battery: 85 },
  ];

  const vehicleDistributionData = vehicles.reduce((acc, vehicle) => {
    const existing = acc.find((item) => item.brand === vehicle.brand);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ brand: vehicle.brand, count: 1 });
    }
    return acc;
  }, [] as { brand: string; count: number }[]);

  const batteryRangeData = [
    {
      range: '0-30%',
      count: vehicles.filter((v) => v.battery_percentage <= 30).length,
    },
    {
      range: '31-60%',
      count: vehicles.filter((v) => v.battery_percentage > 30 && v.battery_percentage <= 60).length,
    },
    {
      range: '61-80%',
      count: vehicles.filter((v) => v.battery_percentage > 60 && v.battery_percentage <= 80).length,
    },
    {
      range: '81-100%',
      count: vehicles.filter((v) => v.battery_percentage > 80).length,
    },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

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

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-600">Add vehicles to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Insights and trends for your fleet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Total Fleet</p>
                <p className="text-4xl font-bold">{vehicles.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 mb-1">Avg Battery</p>
                <p className="text-4xl font-bold">
                  {Math.round(
                    vehicles.reduce((sum, v) => sum + v.battery_percentage, 0) / vehicles.length
                  )}
                  %
                </p>
              </div>
              <Battery className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 mb-1">Active Today</p>
                <p className="text-4xl font-bold">{vehicles.length}</p>
              </div>
              <Activity className="w-12 h-12 text-amber-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Battery History (7 Days)</h2>
            {selectedVehicle && (
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model}
                  </option>
                ))}
              </select>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={batteryHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="battery"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Battery %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Battery Range Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={batteryRangeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {batteryRangeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fleet by Brand</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="brand" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Number of Vehicles" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
