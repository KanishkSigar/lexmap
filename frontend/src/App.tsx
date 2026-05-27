import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import MainApp from './MainApp';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/app" element={
                    <ProtectedRoute>
                        <MainApp />
                    </ProtectedRoute>
                } />
            </Routes>
        </HashRouter>
    );
}

export default App;
