"use client";

import { Token_get } from "@/Actions/Auth/User-get";
import User_get from "../common-Components/User-get";
import { useState, useEffect } from "react";
import { Dashboard_hero } from "./Dashboard-hero";
import { Summary_history } from "./Summary-history";
import { Dashboard_file_section_file_import } from "./Dashboard-file-section-file-import";
import { motion } from "framer-motion";



export const Dashboard_base_file = () => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const fetchedToken = await Token_get();
        console.log("Fetched token:", fetchedToken);  
        setToken(fetchedToken);
      } catch (error) {
        console.error("Error fetching token:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-12 w-12 border-b-2 border-indigo-600"
            ></motion.div>
            <span className="text-lg text-gray-600 dark:text-gray-300">Loading your dashboard...</span>
          </div>
        </div>
      ) : token ? (
        <>
          <User_get
            initialToken={token}
            loading={loading}
            setLoading={setLoading}
          />
          <Dashboard_file_section_file_import />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h3>
            <p className="text-gray-600 dark:text-gray-400">Please log in to access your dashboard.</p>
          </div>
        </div>
      )}
    </div>
  );
};
