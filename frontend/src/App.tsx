import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import MainApp from './MainApp';

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/app" element={<MainApp />} />
            </Routes>
        </HashRouter>
    );
}

export default App;
