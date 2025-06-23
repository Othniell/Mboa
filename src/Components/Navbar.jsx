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
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

// Custom hook for mobile view state management
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

// Reusable SearchForm component
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

// Reusable AuthButtons component
const AuthButtons = React.memo(
  ({
    isMobile = false,
    onButtonClick,
    setShowLoginModal,
    setShowSignupModal,
  }) => {
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
          >
            Logout
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={() => {
            setShowLoginModal(true);
            onButtonClick?.();
          }}
          className={`btn ${isMobile ? "btn-icon-text" : "btn-login"}`}
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
            setShowSignupModal(true);
            onButtonClick?.();
          }}
          className={`btn ${isMobile ? "btn-icon-text" : "btn-signup"}`}
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

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
    setShowLoginModal(false);
    setShowSignupModal(false);
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
                setShowLoginModal={setShowLoginModal}
                setShowSignupModal={setShowSignupModal}
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

      {/* Mobile Search (below navbar) */}
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

      {/* Mobile Menu (slides from right) */}
      {!isDesktop && (
        <>
          <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeAll}></div>
          <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
            <button className="close-menu" onClick={closeAll}>
              <FaTimes />
            </button>
            
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
            
            <div className="mobile-auth">
              <AuthButtons
                isMobile
                onButtonClick={closeAll}
                setShowLoginModal={setShowLoginModal}
                setShowSignupModal={setShowSignupModal}
              />
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setShowLoginModal(false);
            navigate("/dashboard");
          }}
        />
      )}

      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSignupSuccess={() => {
            setShowSignupModal(false);
            navigate("/dashboard");
          }}
        />
      )}
    </>
  );
};

export default Navbar;