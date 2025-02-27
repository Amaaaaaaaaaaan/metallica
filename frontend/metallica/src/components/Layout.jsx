import { Outlet } from 'react-router-dom';
import Sidenav from './sidenav';

const Layout = () => {
  return (
    <div> {/* No <body> here! */}
      <Sidenav />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
