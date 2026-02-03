import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Report } from '@/pages/display/Report';
import { Honor } from '@/pages/display/Honor';
import { Lottery } from '@/pages/Lottery';
import { WeeklyUpload } from '@/pages/admin/WeeklyUpload';
import { HalfYearUpload } from '@/pages/admin/HalfYearUpload';
import { Settings } from '@/pages/admin/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="display/report" element={<Report />} />
          <Route path="display/honor" element={<Honor />} />
          <Route path="lottery" element={<Lottery />} />
          <Route path="admin/weekly" element={<WeeklyUpload />} />
          <Route path="admin/half-year" element={<HalfYearUpload />} />
          <Route path="admin/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
