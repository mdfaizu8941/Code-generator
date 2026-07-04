import Layout from '../components/Layout';
import { LayoutTemplate, ArrowRight, Server, Database, Smartphone, Globe, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const templates = [
  {
    id: 1,
    title: 'RESTful API Backend',
    description: 'Generate a complete Node.js/Express backend with MongoDB, JWT auth, and CRUD operations.',
    prompt: 'Build a secure RESTful API using Express and MongoDB. Include User authentication (register, login, JWT middleware) and a full CRUD route for a "Product" resource with title, description, price, and category fields. Add proper error handling and validation.',
    icon: Server,
    color: 'text-blue-500',
    bg: 'bg-blue-50 ',
    border: 'border-blue-100 ',
    language: 'javascript',
    framework: 'express'
  },
  {
    id: 2,
    title: 'React Dashboard UI',
    description: 'Create a modern, responsive admin dashboard layout with sidebar and metrics.',
    prompt: 'Create a React admin dashboard layout using TailwindCSS. It should have a collapsible sidebar on the left and a top navigation bar. The main content area should feature a 4-column grid of metric cards (Total Users, Revenue, Active Sessions, Conversion Rate) at the top, and a large placeholder chart area below. Use modern styling with subtle shadows and rounded corners.',
    icon: LayoutTemplate,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    language: 'javascript',
    framework: 'react'
  },
  {
    id: 3,
    title: 'Next.js Landing Page',
    description: 'A high-converting SaaS landing page with Hero, Features, and Pricing sections.',
    prompt: 'Build a modern SaaS landing page using Next.js and TailwindCSS. It needs a sticky navbar, a Hero section with a bold headline and two CTA buttons, a Features section with a 3-column grid of icon cards, a Pricing section with 3 tiers (highlighting the middle one), and a simple Footer. Ensure it is fully responsive.',
    icon: Globe,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    language: 'typescript',
    framework: 'nextjs'
  },
  {
    id: 4,
    title: 'Database Schema',
    description: 'Generate complex SQL schemas with relations and constraints.',
    prompt: 'Write an advanced SQL schema for an e-commerce platform. Include tables for Users, Products, Categories, Orders, and OrderItems. Ensure appropriate foreign key constraints, indexes on frequently queried columns (like user email or product category), and ON DELETE CASCADE rules where appropriate.',
    icon: Database,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    language: 'sql',
    framework: 'none'
  },
  {
    id: 5,
    title: 'Authentication Wrapper',
    description: 'A React context provider for managing user state securely.',
    prompt: 'Create a robust React Context provider for Authentication. It should handle login, register, and logout async functions using axios. Include state for "user", "isAuthenticated", and "isLoading". Add a useEffect hook to check for an existing token in localStorage on mount and fetch the user profile if it exists.',
    icon: Shield,
    color: 'text-red-500',
    bg: 'bg-red-50 ',
    border: 'border-red-100',
    language: 'javascript',
    framework: 'react'
  },
  {
    id: 6,
    title: 'Python Data Scraper',
    description: 'A robust web scraper using BeautifulSoup and Requests.',
    prompt: 'Write a Python script using requests and BeautifulSoup4 to scrape a generic e-commerce catalog page. It should extract the product title, price, and image URL for all items matching a specific CSS class. Include error handling for network requests, respect robots.txt (conceptually), and export the final data to a CSV file.',
    icon: Sparkles,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    language: 'python',
    framework: 'none'
  }
];

const Templates = () => {
  const navigate = useNavigate();

  const handleUseTemplate = (template) => {
    // Navigate to dashboard and pass only serializable state (exclude React Component icons)
    const { id, title, description, prompt, language, framework } = template;
    navigate('/dashboard', { 
      state: { 
        template: { id, title, description, prompt, language, framework } 
      } 
    });
  };

  return (
    <Layout>
      <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Prompt Templates</h1>
          <p className="text-lg text-gray-500">
            Kickstart your next project with our curated collection of expert-crafted AI prompts.
            Guaranteed to produce high-quality, production-ready code.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {templates.map((template, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={template.id}
              className={`bg-white   rounded-2xl border ${template.border} p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${template.bg}`}>
                  <template.icon className={`w-6 h-6 ${template.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{template.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-6 flex-1">
                {template.description}
              </p>
              
              <div className="flex items-center gap-2 mb-6">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg uppercase tracking-wide">
                  {template.language}
                </span>
                {template.framework !== 'none' && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg uppercase tracking-wide">
                    {template.framework}
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => handleUseTemplate(template)}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${template.bg} ${template.color} hover:brightness-95`}
              >
                Use Template <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Templates;
