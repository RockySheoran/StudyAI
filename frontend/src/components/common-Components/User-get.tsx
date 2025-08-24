
"use client"

import { useUserStore } from "@/lib/Store/userStore";
import { useEffect } from "react";
import { GetMe_action } from "@/Actions/Auth/GetMe_action";
import { toast } from "sonner";

const User_get = ({ initialToken, loading, setLoading }: { initialToken?: string, loading?: boolean, setLoading: (loading: boolean) => void }) => {
  const { setToken, setProfile, name, email, clearUser } = useUserStore();

  // Initialize token once when component mounts
  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken, setToken]);

  // Fetch user profile data
  useEffect(() => {
    if (initialToken && !name) {
      const getMe = async () => {
        try {
          const res = await GetMe_action({ token: initialToken });
          if (res.status === 200) {
            setProfile(res.data);
          } else if (res.status === 500) {
            toast.error(res.message);
            console.error(res.message);
          }
        } catch (error) {
          toast.error("An error occurred while fetching user data");
          console.error(error);
        }finally{
         setLoading(false);
        }
      };
      getMe();
    }
  }, [initialToken, name, setProfile]);

  return (
    <div className="mt-44">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <> {
          name ? (
            <p>Welcome back, {name}!</p>
          ) : (
            <p>something went wrong</p>
          )
        }
        </>
      )}
    </div>
  );
};

export default User_get;