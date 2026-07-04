import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Code2, LayoutDashboard, History, User, LogOut, Search, 
  Bell, Heart, LayoutTemplate, Box, Settings, Menu, Moon, Sun, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Desktop sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  const { theme, setTheme } = useContext(ThemeContext);
  const hamburgerRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the sidebar for accessibility
      if (sidebarRef.current) sidebarRef.current.focus();
    } else {
      document.body.style.overflow = 'unset';
      if (hamburgerRef.current) hamburgerRef.current.focus();
    }
    
    // Cleanup on unmount
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Favorites', path: '/favorites', icon: Heart },
    { name: 'Templates', path: '/templates', icon: LayoutTemplate },
  ];

  const bottomItems = [
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => {
          if (!isDesktop) setIsMobileMenuOpen(false);
        }}
        className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-xl"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-500 group-hover:text-primary'}`} />
        <AnimatePresence>
          {(isSidebarOpen || !isDesktop) && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className={`relative z-10 whitespace-nowrap font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:hover:text-white dark:text-white'}`}
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  const toggleMenu = () => {
    if (isDesktop) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans relative">
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {!isDesktop && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        ref={sidebarRef}
        tabIndex="-1"
        initial={false}
        animate={{ 
          width: isDesktop ? (isSidebarOpen ? 260 : 80) : 260,
          x: isDesktop ? 0 : (isMobileMenuOpen ? 0 : -260)
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
        className={`bg-white dark:bg-gray-900 dark:bg-white border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 z-40 outline-none
          ${isDesktop ? 'relative' : 'fixed inset-y-0 left-0'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 justify-between shrink-0">
          <div className="flex items-center">
            <Code2 className="w-7 h-7 text-primary mr-3 shrink-0" />
            <AnimatePresence>
              {(isSidebarOpen || !isDesktop) && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap"
                >
                  CodeGen AI
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {!isDesktop && (
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 py-6 px-3 overflow-y-auto overflow-x-hidden flex flex-col gap-1">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">
            {isSidebarOpen || !isDesktop ? 'Menu' : '•••'}
          </div>
          {navItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}

          <div className="mt-8 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3">
            {isSidebarOpen || !isDesktop ? 'Account' : '•••'}
          </div>
          {bottomItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center md:justify-start gap-3 px-4 py-3 w-full text-gray-500 dark:text-gray-500 hover:bg-red-50 dark:bg-red-900/20 hover:text-red-600 rounded-xl transition-colors group focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {(isSidebarOpen || !isDesktop) && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-gray-900 dark:bg-white/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              ref={hamburgerRef}
              onClick={toggleMenu}
              aria-label={isMobileMenuOpen || isSidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={isDesktop ? isSidebarOpen : isMobileMenuOpen}
              className="p-2 -ml-2 text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-800/80 px-4 py-2 rounded-xl w-80 transition focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white dark:bg-gray-900 dark:bg-white border border-transparent focus-within:border-primary/30">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search snippets, prompts, languages..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-full mr-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-2"></span>
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Personal Workspace</span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md sm:ml-2 border-2 border-white dark:border-gray-800 ring-2 ring-gray-100 dark:ring-gray-800 cursor-pointer">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
