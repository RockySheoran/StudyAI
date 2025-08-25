"use client"
import { useUserStore } from "@/lib/Store/userStore";

export const Dashboard_hero = () => {
  const { name, email, avatar } = useUserStore();
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-b-3xl md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* User Info Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row items-center transition-all duration-300 hover:shadow-xl">
          {/* Avatar Section */}
          <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-700 dark:to-indigo-800 overflow-hidden mr-0 md:mr-8 mb-4 md:mb-0 flex items-center justify-center ring-4 ring-white dark:ring-gray-700 shadow-md">
            {avatar ? (
              <img
                src={avatar}
                className="h-full w-full object-cover"
                alt={`${name}'s avatar`}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl md:text-4xl font-bold">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>
          
          {/* Welcome Text */}
          <div className="text-center md:text-left">
            <p className="text-sm md:text-base text-blue-600 dark:text-blue-400 font-medium mb-2">
              Hello there! We're always happy to see you
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Welcome back, {name || "Valued Learner"}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 md:mt-3 text-sm md:text-base">
              {email || "Ready to explore new knowledge today?"}
            </p>
            
            {/* Motivational Quote */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg max-w-md mx-auto md:mx-0">
              <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 italic">
                "Every day is a new opportunity to learn something amazing."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};