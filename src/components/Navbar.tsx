
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, ShoppingBag, Heart } from 'lucide-react';
import Button from './Button';
import SearchBar from './SearchBar';
import AuthModal from './AuthModal';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass py-3 shadow-sm' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-display font-bold animated-gradient">
              CollegeMate
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/explore" className="text-sm font-medium hover:text-primary transition-colors">
              Explore
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </Link>
          </nav>
          
          {/* Search Bar (Desktop) */}
          <div className="hidden md:block">
            <SearchBar />
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {isLoggedIn ? (
              <>
                <Link to="/wishlist" className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
                <Link to="/my-listings" className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="My Listings">
                  <ShoppingBag className="h-5 w-5" />
                </Link>
                <Link to="/profile" className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Profile">
                  <User className="h-5 w-5" />
                </Link>
              </>
            ) : (
              <Button onClick={() => setAuthModalOpen(true)}>Sign In</Button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass absolute top-full left-0 right-0 p-4 shadow-lg animate-slide-down">
            <div className="flex flex-col space-y-4">
              <SearchBar className="w-full mb-2" />
              <Link 
                to="/explore" 
                className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link 
                to="/categories" 
                className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                to="/post-item" 
                className="bg-primary text-white px-4 py-3 rounded-lg text-center font-medium hover:bg-primary/90 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Post an Item
              </Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
