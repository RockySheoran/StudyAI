"use client";

import { Token_get } from "@/Actions/Auth/User-get";
import User_get from "../common-Components/User-get";
import { useState, useEffect } from "react";
import { Dashboard_hero } from "./Dashboard-hero";
import { Summary_history } from "./Summary-history";

export const Dashboard_base_file = () => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);

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
        <User_get
          initialToken={token}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <Dashboard_hero />
          <Summary_history />
        </div>
      )}
    </div>
  );
};
