import { Car, Battery, MapPin, Trash2, CreditCard as Edit } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete: (id: string) => void;
  onEdit: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, onDelete, onEdit }: VehicleCardProps) {
  const getBatteryColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600 bg-green-50';
    if (percentage >= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBatteryBarColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-500">{vehicle.year}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(vehicle)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(vehicle.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className={`flex items-center justify-between p-3 rounded-lg ${getBatteryColor(vehicle.battery_percentage)}`}>
          <div className="flex items-center space-x-2">
            <Battery className="w-5 h-5" />
            <span className="font-medium">Battery</span>
          </div>
          <span className="text-lg font-bold">{vehicle.battery_percentage}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getBatteryBarColor(vehicle.battery_percentage)}`}
            style={{ width: `${vehicle.battery_percentage}%` }}
          />
        </div>

        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <MapPin className="w-4 h-4" />
          <span>
            {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
          </span>
        </div>

        {vehicle.color && (
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: vehicle.color }}
            />
            <span className="capitalize">{vehicle.color}</span>
          </div>
        )}
      </div>
    </div>
  );
}
