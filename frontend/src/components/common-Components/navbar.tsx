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
import { useUserStore } from "@/lib/Store/userStore";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { div } from "framer-motion/client";
import { useTheme } from "next-themes";

interface NavItem {
  name: string;
  icon: JSX.Element;
  route: string;
}

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window?.innerWidth : 1024
  );
  const { name, email, avatar } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  

  // Nav items data
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      icon: <FaHome className="text-lg" />,
      route: "/dashboard",
    },
    {
      name: "Summary",
      icon: <FaFileAlt className="text-lg" />,
      route: "/summary",
    },
    {
      name: "Interview",
      icon: <FaUserTie className="text-lg" />,
      route: "/interviews/new"    ,
    },
    {
      name: "Quiz/QnA",
      icon: <FaQuestionCircle className="text-lg" />,
      route: "/quiz_qna",
    },
    {
      name: "Current Affairs",
      icon: <FaComments className="text-lg" />,
      route: "/current_affairs",
    },
    {
      name: "Topics",
      icon: <FaLightbulb className="text-lg" />,
      route: "/topics",
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



  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDesktopSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <>
      {/* Mobile Top Header - Always visible on mobile */}
      <header className="md:hidden  fixed top-0 left-0 right-0 z-90 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
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
              className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16"
            >
              <div className="flex flex-col h-full overflow-y-auto">
                <nav className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1 px-2 py-4">
                    {navItems.map((item) => (
                      <motion.a
                        key={item.name}
                        href={item.route}
                        className={`flex items-center p-3 rounded-lg transition-colors ${
                          isActive(item.route)
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
                        {isActive(item.route) && (
                          <span className="ml-auto">
                            <FaChevronRight className="text-gray-500" />
                          </span>
                        )}
                      </motion.a>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                    <ThemeToggle/>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {theme === "light" ? "Light Mode" : "Dark Mode"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <motion.div
                          className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white"
                          whileHover={{ scale: 1.1 }}
                        >
                          {avatar ? (
                            <img
                              src={avatar}
                              alt="User"
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            "U"
                          )}
                        </motion.div>
                        <div className="ml-3">
                          <p className="text-sm truncate   font-medium text-gray-700 dark:text-gray-200">
                            {name || "User"}
                          </p>
                          <p className="text-xs truncate text-gray-500 dark:text-gray-400">
                            {email || "user@example.com"}
                          </p>
                        </div>
                      </div>
                      <div >
                        <LogoutButton />
                      </div>
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
                    isActive(item.route)
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
                  {isActive(item.route) && isOpen && (
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

            <div className="p-4 border-t  border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4 mx-auto ">
                <ThemeToggle/>
                {isOpen && (
                  <motion.span
                    className="text-sm text-gray-600 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {theme === "light" ? "Light Mode" : "Dark Mode"}
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
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="User"
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      "U"
                    )}
                  </motion.div>
                  {isOpen && (
                    <motion.div
                      className="ml-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-sm  truncate font-medium text-gray-700 dark:text-gray-200">
                        {name || "User"}
                      </p>
                      <p className="text-xs truncate text-gray-500 dark:text-gray-400">
                        {email || "user@example.com"}
                      </p>
                    </motion.div>
                  )}
                </div>
                {isOpen && (
                  <div >
                    <LogoutButton />
                  </div>
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