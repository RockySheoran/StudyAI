"use client"

import { useUserStore } from "@/lib/Store/userStore";
import { useEffect } from "react";
import { GetMe_action } from "@/Actions/Auth/GetMe_action";
import { toast } from "sonner";

/**
 * Component responsible for initializing user authentication and fetching user profile data
 * @param initialToken - JWT token from session for authentication
 * @param loading - Current loading state
 * @param setLoading - Function to update loading state
 */
const User_get = ({ initialToken, loading, setLoading }: { initialToken?: string, loading?: boolean, setLoading: (loading: boolean) => void }) => {
  const { setToken, setProfile, name, email, clearUser } = useUserStore();

  // Initialize token once when component mounts
  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken, setToken]);

  // Fetch user profile data if token exists and user data is not already loaded
  useEffect(() => {
    if (initialToken && !name) {
      const getMe = async () => {
        try {
          const res = await GetMe_action({ token: initialToken });
          if (res.status === 200) {
            setProfile(res.data);
          } else if (res.status === 500) {
            toast.error(res.message);
          }
        } catch (error) {
          toast.error("An error occurred while fetching user data");
        } finally {
          setLoading(false);
        }
      };
      getMe();
    }
  }, [initialToken, name, setProfile, setLoading]);

  return (
    <div className="">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <> {
         
        }
        </>
      )}
    </div>
  );
};

export default User_get;