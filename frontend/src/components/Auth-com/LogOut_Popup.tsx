"use client";
import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Logout_Action } from "@/Actions/Auth/Logout_Action";
import { useUserStore } from "@/lib/Store/userStore";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { performCompleteCleanup } from "@/lib/utils/storageCleanup";

const LogoutButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useUserStore();
  const { clearUser, clearToken } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      const res = await Logout_Action({ token: token || "" });
      console.log("res:", res);
      
      if (res.status === 200) {
        // Clear all storage data when logout is successful
        await performCompleteCleanup();
        
        // Clear user store
        clearUser();
        clearToken();
        
        // Close dialog
        setIsOpen(false);
        
        // Show success message
        toast.success("Logout successfully");
        
        // Sign out from NextAuth and redirect
        await signOut({ redirect: true, callbackUrl: "/login" });
        
        // Navigate to login page
        router.push("/login");
      } else {
        toast.error("Logout failed");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="">
        <motion.button
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
        >
          <FaSignOutAlt className="text-gray-600 dark:text-gray-300" />
        </motion.button>

        {/* Confirmation Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-lg">Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to logout? Any unsaved changes will be
                  lost.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-4 flex gap-3 justify-center items-center   ">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="px-4 dark:text-white cursor-pointer    "
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    disabled={isLoading}
                    className={`px-4 dark:text-white cursor-pointer ${
                      isLoading ? "opacity-50 cursor-not-allowed disabled" : ""
                    }`}
                  >
                    {isLoading ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default LogoutButton;
