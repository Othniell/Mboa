import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './pages/Home';
import RestaurantsList from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import HotelsList from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import ActivityPage from './pages/Activities';
import ActivityDetail from './pages/ActivitiesDetail';
import LoginForm from './pages/LoginForm';
import TripPlanner from './pages/PlanTrip';
import ProtectedRoute from './Components/ProtectedRoute';
import BusinessDashboard from './pages/BusinessDashboard';
import AdminDashboard from './pages/AdminBusinessReview'
import AdminLogs from "./pages/AdminLogs";
import TripMap from './Components/TripMap';


function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<RestaurantsList />} />
          <Route 
            path="/restaurants/:id" 
            element={
              <ProtectedRoute>
                <RestaurantDetail />
              </ProtectedRoute>
            } 
          />
          <Route path="/hotels" element={<HotelsList />} />
          <Route 
            path="/hotels/:id" 
            element={
              <ProtectedRoute>
                <HotelDetail />
              </ProtectedRoute>
            } 
          />
          <Route path="/activities" element={<ActivityPage />} />
          <Route 
            path="/activities/:id" 
            element={
              <ProtectedRoute>
                <ActivityDetail />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/trip-planner" element={<TripPlanner />} />
            
             <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["business"]}>
                <BusinessDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/logs" element={<AdminLogs />} />

        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;