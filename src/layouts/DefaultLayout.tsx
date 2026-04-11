import { Outlet } from 'react-router';
import Header from './Header';

const DefaultLayout = () => {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-(--header-height) flex flex-col">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default DefaultLayout;
