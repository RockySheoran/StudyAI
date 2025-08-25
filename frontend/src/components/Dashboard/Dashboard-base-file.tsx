"use client";

import { Token_get } from "@/Actions/Auth/User-get";
import User_get from "../common-Components/User-get";
import { useState, useEffect } from "react";
import { Dashboard_hero } from "./Dashboard-hero";
import { Summary_history } from "./Summary-history";
import { Dashboard_file_section_file_import } from "./Dashboard-file-section-file-import";
import { div } from "framer-motion/client";

export const Dashboard_base_file = () => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const fetchedToken = await Token_get();
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
    <div>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      ) : token ? (
        <>
          <User_get
            initialToken={token}
            loading={loading}
            setLoading={setLoading}
          />
          <div className="flex flex-col gap-4">
            <Dashboard_file_section_file_import />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-500">Authentication required</div>
        </div>
      )}
    </div>
  );
};
