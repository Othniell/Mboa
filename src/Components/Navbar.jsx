import React, { useState, useEffect, useCallback } from "react";
import {
  FaHotel,
  FaUtensils,
  FaUmbrellaBeach,
  FaBars,
  FaSearch,
  FaUser,
  FaUserPlus,
  FaTimes,
  FaSignOutAlt, 
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Login from "../pages/LoginForm";
import Signup from "../pages/signUp";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

const useMobileView = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      if (!prev) setIsSearchOpen(false);
      return !prev;
    });
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (!prev) setIsMenuOpen(false);
      return !prev;
    });
  }, []);

  const closeAll = useCallback(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, []);

  return {
    isMenuOpen,
    isSearchOpen,
    toggleMenu,
    toggleSearch,
    closeAll,
  };
};

const SearchForm = React.memo(
  ({ isMobile = false, searchQuery, setSearchQuery, onSubmit }) => (
    <div className={isMobile ? "mobile-search-form" : "navbar-search"}>
      <input
        type="text"
        placeholder={isMobile ? "Search..." : "Search hotels, restaurants..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSubmit(e)}
        aria-label={isMobile ? "Mobile Search" : "Search"}
      />
      <FaSearch className="search-icon" />
    </div>
  )
);

const AuthButtons = React.memo(
  ({ isMobile = false, onButtonClick, setShowLogin, setShowSignup }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (user) {
      return (
        <>
          <span className="nav-user">Hi, {user.name}</span>
          <button
            onClick={() => {
              logout();
              onButtonClick?.();
              navigate("/");
            }}
            className={`btn ${isMobile ? "" : "btn-logout"}`}
            aria-label="Logout"
          >
            <FaSignOutAlt className="logout-icon" />
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={() => {
            setShowLogin(true);
            onButtonClick?.();
          }}
          className={`btn ${isMobile ? "btn-icon-text btn-login" : "btn-login"}`}
          aria-label="Login"
        >
          {isMobile ? (
            <>
              <FaUser />
              <span>Login</span>
            </>
          ) : (
            <>
              <FaUser /> Login
            </>
          )}
        </button>
        <button
          onClick={() => {
            setShowSignup(true);
            onButtonClick?.();
          }}
          className={`btn ${isMobile ? "btn-icon-text btn-signup" : "btn-signup"}`}
          aria-label="Sign Up"
        >
          {isMobile ? (
            <>
              <FaUserPlus />
              <span>Sign Up</span>
            </>
          ) : (
            "Sign Up"
          )}
        </button>
      </>
    );
  }
);

const Navbar = () => {
  const { isMenuOpen, isSearchOpen, toggleMenu, toggleSearch, closeAll } =
    useMobileView();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { path: "/hotels", name: "Hotels", icon: <FaHotel /> },
    { path: "/restaurants", name: "Restaurants", icon: <FaUtensils /> },
    { path: "/activities", name: "Activities", icon: <FaUmbrellaBeach /> },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeAll();
    setShowLogin(false);
    setShowSignup(false);
  }, [location, closeAll]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
        closeAll();
      }
    },
    [searchQuery, navigate, closeAll]
  );

  const renderNavItems = useCallback(
    () =>
      navItems.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={`nav-link ${
              location.pathname.startsWith(item.path) ? "active" : ""
            }`}
            onClick={closeAll}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </Link>
        </li>
      )),
    [location.pathname, closeAll]
  );

  const isDesktop = window.innerWidth > 768;

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-text">MboaDiscovery</span>
          </Link>

          {isDesktop && (
            <SearchForm
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSubmit={handleSearch}
            />
          )}

          {isDesktop && (
            <ul className="navbar-links">
              {renderNavItems()}
            </ul>
          )}

          {isDesktop && (
            <div className="navbar-auth">
              <AuthButtons
                setShowLogin={setShowLogin}
                setShowSignup={setShowSignup}
              />
            </div>
          )}

          {!isDesktop && (
            <div className="mobile-buttons">
              <button
                className="btn-icon search-toggle"
                onClick={toggleSearch}
                aria-label="Toggle search"
              >
                <FaSearch />
              </button>
              <button
                className="mobile-menu-toggle"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          )}
        </div>
      </nav>

      {!isDesktop && isSearchOpen && (
        <div className="mobile-search-wrapper">
          <SearchForm
            isMobile
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSubmit={handleSearch}
          />
        </div>
      )}

      {!isDesktop && (
        <>
          <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeAll}></div>
          <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
            <button className="close-menu" onClick={closeAll}>
              <FaTimes />
            </button>
            
            <div className="mobile-auth">
              <AuthButtons
                isMobile
                onButtonClick={closeAll}
                setShowLogin={setShowLogin}
                setShowSignup={setShowSignup}
              />
            </div>
            
            <ul className="mobile-nav-links">
              {renderNavItems()}
            </ul>
            
            <div className="mobile-search">
              <SearchForm
                isMobile
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSubmit={handleSearch}
              />
            </div>
          </div>
        </>
      )}

      {showLogin && (
        <Login
          isModal={true}
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => {
            setShowLogin(false);
            navigate("/dashboard");
          }}
        />
      )}

      {showSignup && (
        <Signup
          isModal={true}
          onClose={() => setShowSignup(false)}
          onSignupSuccess={() => {
            setShowSignup(false);
            navigate("/dashboard");
          }}
        />
      )}
    </>
  );
};

export default Navbar;