
# EV Fleet & Charging Management System

A comprehensive full-stack web application for managing electric vehicle fleets with real-time tracking, charging station locations, and analytics.

## Features

### Authentication & Security
- Secure user registration and login
- JWT-based authentication via Supabase
- Protected routes and user-specific data
- Row Level Security (RLS) policies

### Vehicle Management
- Add, edit, and delete vehicles
- Track battery percentage, location, and details
- Real-time vehicle data updates
- Vehicle search and filtering capabilities

### Dashboard
- Overview of entire fleet
- Summary statistics (total vehicles, average battery, low battery alerts)
- Card-based vehicle display
- Quick access to vehicle actions

### Live Map Tracking
- Interactive map using Leaflet
- Real-time vehicle location tracking
- User geolocation detection
- Charging station locations with details
- Custom markers for vehicles, stations, and user location
- Popup information cards

### Analytics
- Battery history trends over time
- Fleet distribution by brand
- Battery range distribution
- Interactive charts using Recharts
- Vehicle-specific analytics

### Real-time Features
- Live vehicle tracking with Supabase real-time subscriptions
- Automatic data updates across all clients
- Real-time battery status monitoring

## Technology Stack

### Frontend
- **React 18** - UI framework with functional components and hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive styling
- **React Router** - Client-side routing
- **Leaflet / React-Leaflet** - Interactive maps
- **Recharts** - Data visualization and charts
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)

### Build Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx       # Navigation bar
│   ├── ProtectedRoute.tsx  # Route authentication wrapper
│   ├── VehicleCard.tsx  # Vehicle display card
│   └── VehicleModal.tsx # Add/Edit vehicle modal
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client configuration
│   └── database.types.ts # TypeScript database types
├── pages/               # Application pages
│   ├── Login.tsx        # Login page
│   ├── Register.tsx     # Registration page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── MapView.tsx      # Live map view
│   └── Analytics.tsx    # Analytics and charts
├── App.tsx              # Main app component with routing
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Database Schema

### Tables

#### vehicles
- `id` - Unique identifier
- `user_id` - Owner reference
- `brand` - Vehicle manufacturer
- `model` - Vehicle model
- `year` - Manufacturing year
- `battery_percentage` - Current battery level (0-100)
- `latitude` - Current latitude
- `longitude` - Current longitude
- `vin` - Vehicle Identification Number (optional)
- `color` - Vehicle color (optional)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

#### battery_history
- `id` - Unique identifier
- `vehicle_id` - Vehicle reference
- `battery_percentage` - Battery level
- `recorded_at` - Recording timestamp

#### charging_stations
- `id` - Unique identifier
- `name` - Station name
- `address` - Physical address
- `latitude` - Station latitude
- `longitude` - Station longitude
- `charger_type` - Type of charger
- `available_ports` - Available charging ports
- `total_ports` - Total charging ports
- `created_at` - Creation timestamp

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### 1. Register/Login
- Navigate to the application
- Create a new account or login with existing credentials

### 2. Add Vehicles
- Click "Add Vehicle" on the dashboard
- Fill in vehicle details (brand, model, year, battery, location)
- The system will auto-detect your location for new vehicles

### 3. Manage Fleet
- View all vehicles on the dashboard
- Edit vehicle details by clicking the edit icon
- Delete vehicles with the trash icon
- Monitor battery levels and low battery alerts

### 4. Track on Map
- Navigate to the Map view
- See all your vehicles on an interactive map
- View nearby charging stations
- Click markers for detailed information

### 5. View Analytics
- Navigate to Analytics page
- View battery history trends
- Analyze fleet distribution
- Monitor battery range distribution

## Key Features Explained

### Real-time Tracking
The application uses Supabase real-time subscriptions to automatically update vehicle data across all connected clients without requiring page refreshes.

### Geolocation
The app uses the browser's Geolocation API to:
- Show user's current location on the map
- Auto-populate location fields when adding vehicles
- Calculate distances to charging stations

### Security
- All data is protected with Row Level Security (RLS)
- Users can only access their own vehicles
- Authentication required for all protected routes
- Secure password handling via Supabase Auth

### Responsive Design
The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Future Enhancements

- Role-based access control (Admin/User)
- Advanced search and filtering
- Dark mode theme
- Pagination for large fleets
- Route optimization for charging
- Push notifications for low battery
- Vehicle maintenance tracking
- Charging session history
- Export data to CSV/PDF

## License

MIT License

