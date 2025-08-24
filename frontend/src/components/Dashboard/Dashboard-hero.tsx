import { useUserStore } from "@/lib/Store/userStore";

export const Dashboard_hero = () => {
    const { name, email, avatar } = useUserStore();
  return (
    <div className=" bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* User Info Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex items-center">
          <div className="h-20 w-20 rounded-full bg-blue-100 overflow-hidden mr-6">
            {avatar ? (
              <img
                src={avatar}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-2xl font-bold">
                {name ? name.charAt(0).toUpperCase() : "User"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {name || "User"}!
            </h1>
            <p className="text-gray-600 mt-1">
              {email || "Ready to learn something new today?"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
