import Image from "next/image";
import { motion } from "framer-motion";
// Header Component
function Header() {
  return (
    <header className="w-full py-12 flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6">
        <Image 
          src="/Logo2.jpg" 
          alt="StudyAI Logo" 
          width={120} 
          height={120} 
          className="rounded-lg"
        />
      </div>
      <motion.h1 
        className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to <span className="text-indigo-600 dark:text-indigo-400">StudyAI</span>
      </motion.h1>
      <motion.p 
        className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Your AI-powered study companion that helps you learn smarter, not harder. 
        From summarizing complex PDFs to preparing for interviews, StudyAI has you covered.
      </motion.p>
    </header>
  );
}

export default Header;