import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleModal, VehicleFormData } from '../components/VehicleModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Car, Battery, TrendingUp } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

export function Dashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (formData: VehicleFormData) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('vehicles').insert([
        {
          ...formData,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      await fetchVehicles();
      setModalOpen(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateVehicle = async (formData: VehicleFormData) => {
    if (!editingVehicle) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .update(formData)
        .eq('id', editingVehicle.id);

      if (error) throw error;

      await fetchVehicles();
      setModalOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);

      if (error) throw error;

      await fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingVehicle(null);
  };

  const totalVehicles = vehicles.length;
  const avgBattery =
    vehicles.length > 0
      ? Math.round(
          vehicles.reduce((sum, v) => sum + v.battery_percentage, 0) / vehicles.length
        )
      : 0;
  const lowBatteryCount = vehicles.filter((v) => v.battery_percentage < 30).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your electric vehicle fleet</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Vehicle</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Vehicles</p>
                <p className="text-3xl font-bold text-gray-900">{totalVehicles}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Battery</p>
                <p className="text-3xl font-bold text-gray-900">{avgBattery}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Battery className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Battery</p>
                <p className="text-3xl font-bold text-gray-900">{lowBatteryCount}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first electric vehicle
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Vehicle</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onDelete={handleDeleteVehicle}
                onEdit={handleEditVehicle}
              />
            ))}
          </div>
        )}
      </div>

      <VehicleModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
        vehicle={editingVehicle}
        loading={submitting}
      />
    </div>
  );
}
