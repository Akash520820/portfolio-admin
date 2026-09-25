import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { buttonBounce } from '../utils/motion';

const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || '/';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.header
      className="site-nav"
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="site-nav__inner">
        <Link to="/" className="site-nav__brand">
          <span className="site-nav__brand-icon"></span>
          Portfolio Admin
        </Link>

        <nav className="site-nav__links is-open">
          <a
            href={PUBLIC_SITE_URL}
            className="site-nav__link site-nav__link--outline"
            target="_blank"
            rel="noreferrer"
          >
            View site
          </a>
          {user && (
            <>
              <span className="site-nav__user">{user.name}</span>
              <motion.button
                className="site-nav__link site-nav__logout"
                onClick={handleLogout}
                {...buttonBounce}
              >
                Logout
              </motion.button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;
