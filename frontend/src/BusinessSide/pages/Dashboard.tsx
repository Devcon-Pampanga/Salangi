import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />

      <main className = "bg-[#222222]" style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default Dashboard;