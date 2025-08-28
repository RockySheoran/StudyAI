import { Dashboard_hero } from "./Dashboard-hero";
import { Interview_history } from "./Interview-history";
import { Summary_history   } from "./Summary-history";
import { Quiz_Qna_History } from "./Quiz_Qna_History";
import { Topic_History } from "./Topic_history";
import Current_Affairs_History from "./Current_Affairs_history";
import { motion } from "framer-motion";

export const Dashboard_file_section_file_import = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Dashboard_hero />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                    staggerChildren: 0.1,
                    delayChildren: 0.2
                }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8"
            >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Summary_history />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Interview_history />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Quiz_Qna_History />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Current_Affairs_History/>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Topic_History/>
                </motion.div>
            </motion.div>
        </div>
    )
}