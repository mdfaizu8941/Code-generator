import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, Zap, Save, Lock, Layout, ArrowRight, GitBranch } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">CodeGen AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-white transition">Log in</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6"
        >
          Generate Production-Ready <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Code with AI</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl text-gray-500 dark:text-gray-500 mb-10 max-w-2xl mx-auto"
        >
          Accelerate your development workflow. Describe what you need, choose your stack, and let our advanced AI write clean, maintainable code for you in seconds.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center gap-4"
        >
          <Link to="/register" className="btn-primary flex items-center gap-2 px-8 py-4 text-lg">
            Start Generating <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#features" className="btn-outline px-8 py-4 text-lg">
            View Features
          </a>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-950 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to build faster</h2>
            <p className="text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">Our platform combines the power of AI with an intuitive interface, giving you the ultimate coding superpower.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Instant Generation"
              description="Write a simple prompt and get complete, working code in seconds, not hours."
            />
            <FeatureCard 
              icon={<Layout className="w-6 h-6 text-primary" />}
              title="Multiple Frameworks"
              description="Support for React, Vue, Next.js, Express, Django, Spring Boot, and more."
            />
            <FeatureCard 
              icon={<Save className="w-6 h-6 text-primary" />}
              title="Save & Organize"
              description="Keep your generated snippets organized and accessible in your personal library."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-primary" />}
              title="Secure Cloud"
              description="Your snippets and data are securely stored and synced across all your devices."
            />
            <FeatureCard 
              icon={<Code2 className="w-6 h-6 text-primary" />}
              title="Smart Editor"
              description="Built-in Monaco editor with syntax highlighting, auto-formatting, and one-click copy."
            />
            <FeatureCard 
              icon={<GitBranch className="w-6 h-6 text-primary" />}
              title="Version History"
              description="Keep track of your generated code over time and never lose a great snippet."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Code2 className="w-6 h-6 text-primary" />
            <span className="font-bold text-gray-900 dark:text-white">CodeGen AI</span>
          </div>
          <div className="flex gap-6 text-gray-500 dark:text-gray-500 text-sm">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white dark:text-white">About</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white dark:text-white">Privacy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white dark:text-white">Terms</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white dark:text-white">Contact</a>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} CodeGen AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white dark:bg-gray-900 dark:bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-500">{description}</p>
    </div>
  );
};

export default LandingPage;
