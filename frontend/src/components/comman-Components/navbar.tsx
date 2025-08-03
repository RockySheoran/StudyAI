"use client";
import { useState, useEffect, JSX } from "react";
import {
  FaSun,
  FaMoon,
  FaBars,
  FaSignOutAlt,
  FaHome,
  FaFileAlt,
  FaUserTie,
  FaQuestionCircle,
  FaComments,
  FaLightbulb,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import LogoutButton from "../Auth-com/LogOut_Popup";

interface NavItem {
  name: string;
  icon: JSX.Element;
  route: string;
  isActive?: boolean;
}

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window?.innerWidth : 1024
  );

  // Nav items data
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      icon: <FaHome className="text-lg" />,
      route: "/dashboard",
      isActive: true,
    },
    {
      name: "Summary",
      icon: <FaFileAlt className="text-lg" />,
      route: "/summary",
      isActive: false,
    },
    {
      name: "Interview",
      icon: <FaUserTie className="text-lg" />,
      route: "/interview",
      isActive: false,
    },
    {
      name: "Quiz/QnA",
      icon: <FaQuestionCircle className="text-lg" />,
      route: "/quiz",
      isActive: false,
    },
    {
      name: "English Conversation",
      icon: <FaComments className="text-lg" />,
      route: "/english-conversation",
      isActive: false,
    },
    {
      name: "Topics",
      icon: <FaLightbulb className="text-lg" />,
      route: "/topics",
      isActive: false,
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window?.innerWidth);
      if (window?.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDesktopSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Top Header - Always visible on mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
        <motion.h1
          className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Logo
        </motion.h1>

        <div className="flex items-center space-x-4">
          <motion.button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md bg-indigo-600 text-white dark:bg-indigo-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </div>
      </header>

      {/* Mobile Sidebar Menu - Appears when menu button is clicked */}
      <AnimatePresence>
        {mobileMenuOpen && windowWidth < 768 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64  bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16"
            >
              <div className="flex flex-col h-full overflow-y-auto">
                <nav className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1 px-2 py-4">
                    {navItems.map((item) => (
                      <motion.a
                        key={item.name}
                        href={item.route}
                        className={`flex items-center p-3 rounded-lg transition-colors ${
                          item.isActive
                            ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                            : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        }`}
                        whileHover={{ x: 5 }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-gray-600 dark:text-gray-300">
                          {item.icon}
                        </span>
                        <span className="ml-3">{item.name}</span>
                        {item.isActive && (
                          <span className="ml-auto">
                            <FaChevronRight className="text-gray-500" />
                          </span>
                        )}
                      </motion.a>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <motion.button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {darkMode ? (
                          <FaSun className="text-yellow-400" />
                        ) : (
                          <FaMoon className="text-gray-600" />
                        )}
                      </motion.button>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {darkMode ? "Light Mode" : "Dark Mode"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <motion.div
                          className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white"
                          whileHover={{ scale: 1.1 }}
                        >
                          U
                        </motion.div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            User
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            user@example.com
                          </p>
                        </div>
                      </div>
                      <motion.button
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaSignOutAlt className="text-gray-600 dark:text-gray-300" />
                      </motion.button>
                    </div>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always visible on desktop */}
      <motion.div
        className={`hidden md:flex fixed inset-y-0 transition-all duration-300 left-0 z-40 flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            {isOpen && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                Logo
              </motion.h1>
            )}
            <motion.button
              onClick={toggleDesktopSidebar}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaBars className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>

          <nav className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-1 px-2">
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.route}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    item.isActive
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <span className="text-gray-600 dark:text-gray-300">
                    {item.icon}
                  </span>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-3"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {item.isActive && isOpen && (
                    <motion.span
                      className="ml-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <FaChevronRight className="text-gray-500" />
                    </motion.span>
                  )}
                </motion.a>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {darkMode ? (
                    <FaSun className="text-yellow-400" />
                  ) : (
                    <FaMoon className="text-gray-600" />
                  )}
                </motion.button>
                {isOpen && (
                  <motion.span
                    className="text-sm text-gray-600 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </motion.span>
                )}
              </div>

              <div
                className={`flex items-center ${
                  isOpen ? "justify-between" : "justify-center"
                }`}
              >
                <div className="flex items-center">
                  <motion.div
                    className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white"
                    whileHover={{ scale: 1.1 }}
                  >
                    U
                  </motion.div>
                  {isOpen && (
                    <motion.div
                      className="ml-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        User
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        user@example.com
                      </p>
                    </motion.div>
                  )}
                </div>
                {isOpen && (
                  <motion.button
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {/* <FaSignOutAlt className="text-gray-600 dark:text-gray-300" />
                     */}
                    <LogoutButton />{" "}
                  </motion.button>
                )}
              </div>
            </div>
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;
