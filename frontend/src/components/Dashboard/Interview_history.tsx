"use client";
import { useInterviewHistoryStore } from "@/lib/Store/Interview/Interview_history_store";
import { useUserStore } from "@/lib/Store/userStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IInterview } from "@/types/Interview-type";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const Interview_history = () => {
  const { token } = useUserStore();
  const { interviews, loading, error, fetchInterviews } =
    useInterviewHistoryStore();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInterviews(token);
    }
  }, [token, fetchInterviews]);

  // Get only the latest 2 interviews for dashboard
  const recentInterviews = interviews?.slice(0, 2);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case "personal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700";
      case "technical":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600";
    }
  };

  const handleRefresh = async () => {
    if (!token) return;
    setIsRefreshing(true);
    await fetchInterviews(token);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSeeAll = () => {
    router.push("/interviews/history");
  };

  const handleCardClick = (id: string) => {
    router.push(`/interviews/${id}?details=true`);
  };

  const handleStartNew = () => {
    router.push("/interviews/new");
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading your interview history...
          </p>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
  //       <motion.div
  //         initial={{ opacity: 0, y: 20 }}
  //         animate={{ opacity: 1, y: 0 }}
  //         className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
  //       >
  //         <div className="text-red-600 dark:text-red-400 mb-4">
  //           <svg
  //             className="mx-auto h-12 w-12"
  //             fill="none"
  //             viewBox="0 0 24 24"
  //             stroke="currentColor"
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               strokeWidth={2}
  //               d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
  //             />
  //           </svg>
  //         </div>
  //         <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
  //           Error Loading Interview History
  //         </h3>
  //         <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
  //         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  //           <Button
  //             onClick={() => token && fetchInterviews(token)}
  //             variant="destructive"
  //           >
  //             Try Again
  //           </Button>
  //         </motion.div>
  //       </motion.div>
  //     </div>
  //   );
  // }

  

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Interviews History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your latest {recentInterviews.length} interviews
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={handleRefresh}
                            disabled={loading}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <motion.svg 
                                animate={{ rotate: isRefreshing ? 360 : 0 }}
                                transition={{ duration: 0.5, repeat: isRefreshing ? Infinity : 0 }}
                                className="h-4 w-4" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </motion.svg>
                            Refresh
                        </Button>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={handleStartNew}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                           <span className="hidden md:block">Start .</span> New Interview
                        </Button>
                    </motion.div> */}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSeeAll}
              variant="ghost"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
            >
              See More
              <ExternalLink className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Interview List */}
      <AnimatePresence mode="popLayout">
        {recentInterviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
          >
            <div className="bg-gray-50 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              No interviews yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Start your first interview to see your history here.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleStartNew}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Your First Interview
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
          >
            {recentInterviews.map((interview, index) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleCardClick(interview._id)}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getInterviewTypeColor(
                          interview.type
                        )}`}
                      >
                        {interview.type === "personal"
                          ? "Personal Interview"
                          : "Technical Interview"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(interview.createdAt)}
                      </span>
                      {interview.completedAt && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interview Details */}
                <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span className="font-medium">Questions:</span>{" "}
                        {
                          interview.messages.filter(
                            (m) => m.role === "assistant"
                          ).length
                        }
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Responses:</span>{" "}
                        {
                          interview.messages.filter((m) => m.role === "user")
                            .length
                        }
                      </p>
                    </div>

                    {interview.feedback && (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < interview.feedback!.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({interview.feedback.rating}/5)
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Rated
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {interview.completedAt && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (interview.messages.filter((m) => m.role === "user")
                              .length /
                              interview.messages.filter(
                                (m) => m.role === "assistant"
                              ).length) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      Completion:{" "}
                      {Math.round(
                        (interview.messages.filter((m) => m.role === "user")
                          .length /
                          interview.messages.filter(
                            (m) => m.role === "assistant"
                          ).length) *
                          100
                      )}
                      %
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
