import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-10 flex justify-between items-center p-4 bg-green-500/80 h-(--header-height)">
      <nav>
        <ul className="flex gap-3 items-center">
          <li>
            <Link to="/shipment">Shipment</Link>
          </li>
          <li>
            <Link to="/assignment">Assignment</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
