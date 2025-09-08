"use client"
import { useUserStore } from "@/lib/Store/userStore";
import { motion } from "framer-motion";
import { FaUser, FaRobot } from "react-icons/fa";
import RefreshHistoryButton from "./RefreshHistoryButton";

export const Dashboard_hero = () => {
  const { name, email, avatar } = useUserStore();
  
  return (
    <div className=" transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-10 flex flex-col md:flex-row items-center transition-all duration-300 hover:shadow-2xl backdrop-blur-sm"
        >
          {/* Avatar Section */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="h-28 w-28 md:h-36 md:w-36 rounded-full bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden mr-0 md:mr-10 mb-6 md:mb-0 flex items-center justify-center ring-4 ring-indigo-200 dark:ring-indigo-800 shadow-lg"
          >
            {avatar ? (
              <img
                src={avatar}
                className="h-full w-full object-cover"
                alt={`${name}'s avatar`}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-indigo-600 dark:bg-indigo-700 text-white text-4xl md:text-5xl font-bold">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </motion.div>
          
          {/* Welcome Text */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center md:text-left flex-1"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-base md:text-lg text-indigo-600 dark:text-indigo-400 font-semibold mb-3"
            >
              Hello there! We're always happy to see you ✨
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight"
            >
              Welcome back, {name || "Valued Learner"}!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-6"
            >
              {email || "Ready to explore new knowledge today?"}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 max-w-lg mx-auto md:mx-0 shadow-sm"
            >
              <div className="flex items-center mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <FaRobot className="text-indigo-600 dark:text-indigo-400 text-lg mr-3" />
                </motion.div>
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">StudyAI</span>
              </div>
              <p className="text-sm md:text-base text-indigo-700 dark:text-indigo-300 italic font-medium">
                "Explore the whole new way of studying through StudyAI."
              </p>
            </motion.div>
            
            {/* Refresh History Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="mt-6 flex justify-center md:justify-start"
            >
              <RefreshHistoryButton
                onRefresh={() => {
                  // Force page reload to refresh all components
                  window.location.reload();
                }}
                className=""
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};