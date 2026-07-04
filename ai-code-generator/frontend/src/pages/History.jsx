import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search, Code2, Clock, Trash2, ExternalLink, Heart, Download, Copy, Check, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { downloadFile, downloadZip } from '../utils/exportUtils';

const languages = ['all', 'javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'sql'];

const History = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('all');
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSnippets();
  }, [search, language]);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (language !== 'all') query.append('language', language);
      
      const res = await api.get(`/snippets?${query.toString()}`);
      setSnippets(res.data.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(snippets.filter(s => s._id !== id));
      if (selectedSnippet?._id === id) setSelectedSnippet(null);
      toast.success('Snippet deleted');
    } catch (error) {
      toast.error('Failed to delete snippet');
    }
  };

  const handleToggleFavorite = async (snippet, e) => {
    e.stopPropagation();
    try {
      await api.put(`/snippets/${snippet._id}`, { isFavorite: !snippet.isFavorite });
      setSnippets(snippets.map(s => s._id === snippet._id ? { ...s, isFavorite: !s.isFavorite } : s));
      if (selectedSnippet?._id === snippet._id) {
        setSelectedSnippet({ ...selectedSnippet, isFavorite: !snippet.isFavorite });
      }
      toast.success(snippet.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (snippet, e) => {
    if (e) e.stopPropagation();
    if (['react', 'nextjs', 'express'].includes(snippet.framework)) {
      downloadZip(snippet.generatedCode, snippet.language, snippet.title).catch(() => toast.error('Failed to zip'));
    } else {
      downloadFile(snippet.generatedCode, `${snippet.title.replace(/\s+/g, '_')}.${snippet.language === 'python' ? 'py' : 'js'}`);
    }
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Snippets</h1>
            <p className="text-gray-500 dark:text-gray-500">View and manage your previously generated code.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search snippets..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 text-sm py-2"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field pl-9 pr-8 text-sm py-2 appearance-none cursor-pointer min-w-[140px]"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="card-container h-48 skeleton"></div>
            ))}
          </div>
        ) : snippets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Code2 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-700 mb-2">No snippets found</h3>
            <p className="text-gray-500 dark:text-gray-500 max-w-sm mb-8">
              {search || language !== 'all' 
                ? "Your search filters didn't match any saved snippets." 
                : "You haven't saved any code snippets yet. Start building something amazing!"}
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary shadow-lg shadow-primary/30 px-8">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max pb-8">
            <AnimatePresence>
              {snippets.map((snippet, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  key={snippet._id}
                  className="bg-white dark:bg-gray-900 dark:bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 cursor-pointer group transition-all p-5 flex flex-col h-56"
                  onClick={() => setSelectedSnippet(snippet)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 pr-2 leading-tight flex-1">
                      {snippet.title}
                    </h3>
                    <button 
                      onClick={(e) => handleToggleFavorite(snippet, e)}
                      className={`p-2 -mr-2 -mt-2 rounded-full transition-colors ${snippet.isFavorite ? 'text-red-500 hover:bg-red-50 dark:bg-red-900/20' : 'text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-950'}`}
                    >
                      <Heart className={`w-5 h-5 ${snippet.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2 mb-auto">
                    {snippet.prompt}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4 mt-4 flex-wrap">
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                      {snippet.language}
                    </span>
                    {snippet.framework !== 'none' && (
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">
                        {snippet.framework}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(snippet.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(snippet, e); }} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-md">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDelete(snippet._id, e)} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:bg-red-900/20 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Modal 
          isOpen={!!selectedSnippet} 
          onClose={() => setSelectedSnippet(null)}
          title={selectedSnippet?.title || 'Snippet Details'}
          maxWidth="max-w-5xl"
        >
          {selectedSnippet && (
            <div className="flex flex-col h-[70vh]">
              <div className="flex flex-wrap gap-4 items-start justify-between mb-6 shrink-0">
                <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 font-medium mb-1 uppercase tracking-wider text-xs">Original Prompt</p>
                  <p className="text-gray-900 dark:text-white leading-relaxed">{selectedSnippet.prompt}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => handleCopy(selectedSnippet.generatedCode)} className="btn-outline flex justify-center items-center gap-2">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} Copy Code
                  </button>
                  <button onClick={() => handleDownload(selectedSnippet)} className="btn-primary flex justify-center items-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={(e) => handleDelete(selectedSnippet._id, e)} className="btn-outline text-red-500 hover:bg-red-50 dark:bg-red-900/20 flex justify-center items-center gap-2 border-red-100">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
              
              <div className="flex-1 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-[#FAFAFA]">
                <Editor
                  height="100%"
                  language={selectedSnippet.language === 'c++' ? 'cpp' : selectedSnippet.language}
                  theme="vs-light"
                  value={selectedSnippet.generatedCode}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                    wordWrap: 'on',
                    readOnly: true,
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default History;
