import './App.css';
import Header from './components/header/header';
import './index.css';
import Main from './components/main/main';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PokeCard from './components/PokeCard/PokeCard';
import { TeamProvider } from './context/TeamContext';
import MyTeam from './components/MyTeam/MyTeam';
import RegionMap from './components/RegionMap/RegionMap';

function App() {
  return (
    <TeamProvider>
      <Router>
        <div className="app-container">
          <Header />
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/pokemon/:id" element={<PokeCard />} />
              <Route path="/team" element={<MyTeam />} />
              <Route path="/map" element={<RegionMap />} />
            </Routes>
          </div>
        </div>
      </Router>
    </TeamProvider>
  );
}

export default App;
