import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Battery, LayoutDashboard, Map, BarChart3, LogOut } from 'lucide-react';

export function Navbar() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Battery className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold text-gray-800">EV Fleet</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                  isActive('/dashboard')
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/map"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                  isActive('/map')
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Map className="w-5 h-5" />
                <span>Map</span>
              </Link>

              <Link
                to="/analytics"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                  isActive('/analytics')
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 hidden sm:block">
              {user?.email}
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
