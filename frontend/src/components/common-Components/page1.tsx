// components/common-Components/page1.tsx
"use client"

import { useUserStore } from "@/lib/Store/userStore";
import { useEffect } from "react";
import { GetMe_action } from "@/Actions/Auth/GetMe_action";
import { toast } from "sonner";

const Page1 = ({ initialToken }: { initialToken?: string }) => {
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
        }
      };
      getMe();
    }
  }, [initialToken, name, setProfile]);

  return (
    <div className="mt-44">
      {name ? (
        <p>Welcome back, {name}!</p>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Page1;