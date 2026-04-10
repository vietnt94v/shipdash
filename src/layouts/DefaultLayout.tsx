import { Outlet } from 'react-router';
import Header from '../components/Header';

const DefaultLayout = () => {
  return (
    <>
      <div className="h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default DefaultLayout;
