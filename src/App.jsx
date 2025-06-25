import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './pages/Home';
import Restaurants from './pages/Restaurants'  // We'll create this

function App() {
  return (
      <div>
        
           <Router>
        <Navbar />
        <Routes>
        
          <Route path="/" element={<Home />} />
        
          <Route path="/restaurants" element={<Restaurants />} />
          {/*<Route path="/hotels" element={<Restaurants />} />*/}
        </Routes>
        <Footer />
        </Router>
      </div>
  );
}

export default App;