import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Subscribe } from './pages/Subscribe';
import { Membership } from './pages/Membership';
import { Simulator } from './pages/Simulator';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="subscribe" element={<Subscribe />} />
        <Route path="membership" element={<Membership />} />
        <Route path="simulator" element={<Simulator />} />
      </Route>
    </Routes>
  );
}
