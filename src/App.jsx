import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './pages/Home';
import RestaurantsList from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<RestaurantsList/>} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />

        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;