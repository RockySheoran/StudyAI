import {  FaEnvelope, FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
function Footer() {
  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">StudyAI</h3>
            <p className="text-gray-600 dark:text-gray-300">
              The AI-powered study assistant that helps you learn more effectively.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
              <FaEnvelope className="mr-2" />
              <span>support@studyai.com</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                <FaGithub className="text-xl" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Newsletter</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Subscribe to get updates on new features.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} StudyAI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;