
"use client"

import { useUserStore } from "@/lib/Store/userStore";
import { useEffect } from "react";
import { GetMe_action } from "@/Actions/Auth/GetMe_action";
import { toast } from "sonner";

const User_get = ({ initialToken, loading, setLoading }: { initialToken?: string, loading?: boolean, setLoading: (loading: boolean) => void }) => {
  const { setToken, setProfile, name, email, clearUser } = useUserStore();
<<<<<<< HEAD
console.log(initialToken ,"vmkfd vkdf")
=======
  console.log("vbyuhfvbwkvfirst", initialToken)
>>>>>>> f45cdcc1af4564c3d5ba7c3f7d1c02532fafca47
  // Initialize token once when component mounts
  useEffect(() => {
    if (initialToken) {
      console.log("first" , initialToken  )
      setToken(initialToken);
    }
  }, [initialToken, setToken]);

  // Fetch user profile data
  useEffect(() => {
<<<<<<< HEAD
    if (initialToken && !name) {
      console.log(initialToken)
=======
    if (initialToken ) {
>>>>>>> f45cdcc1af4564c3d5ba7c3f7d1c02532fafca47
      const getMe = async () => {
        try {
          console.log("first" , initialToken)
          const res = await GetMe_action({ token: initialToken });
          console.log("GetMe_action response:", res);
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