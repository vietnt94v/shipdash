import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-10 flex justify-between items-center p-4 bg-gray-200 border-b border-gray-200 h-(--header-height)">
      <nav>
        <ul className="flex gap-3 items-center">
          <li>
            <NavLink
              to="/shipment"
              className={({ isActive }) => `font-bold py-4 px-2 ${isActive ? 'text-green-500/70' : ''}`}
            >
              Shipment
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/assignment"
              className={({ isActive }) => `font-bold py-4 px-2 ${isActive ? 'text-green-500/70' : ''}`}
            >
              Assignment
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
