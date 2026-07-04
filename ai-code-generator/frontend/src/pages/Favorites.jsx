import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search, Code2, Clock, Trash2, ExternalLink, Heart, Download, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadFile, downloadZip } from '../utils/exportUtils';

const Favorites = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/snippets?isFavorite=true');
      setSnippets(res.data.data);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (snippet, e) => {
    e.stopPropagation();
    try {
      await api.put(`/snippets/${snippet._id}`, { isFavorite: false });
      setSnippets(snippets.filter(s => s._id !== snippet._id));
      if (selectedSnippet?._id === snippet._id) setSelectedSnippet(null);
      toast.success('Removed from favorites');
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Favorite Snippets</h1>
          <p className="text-gray-500">Your most used and loved generated code.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card-container h-48 skeleton"></div>
            ))}
          </div>
        ) : snippets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Heart className="w-12 h-12 text-red-300 fill-current" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No favorites yet</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              Click the heart icon on any generated snippet in your history to save it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max pb-8">
            <AnimatePresence>
              {snippets.map((snippet, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  key={snippet._id}
                  className="bg-white rounded-2xl border border-red-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-red-300 cursor-pointer group transition-all p-5 flex flex-col h-56"
                  onClick={() => setSelectedSnippet(snippet)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 pr-2 leading-tight flex-1">
                      {snippet.title}
                    </h3>
                    <button 
                      onClick={(e) => handleToggleFavorite(snippet, e)}
                      className="p-2 -mr-2 -mt-2 rounded-full transition-colors text-red-500 hover:bg-red-50"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-auto">
                    {snippet.prompt}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4 mt-4 flex-wrap">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                      {snippet.language}
                    </span>
                    {snippet.framework !== 'none' && (
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">
                        {snippet.framework}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center text-xs text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(snippet.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(snippet, e); }} className="p-1.5 text-gray-400 hover:text-gray-900 :text-white hover:bg-gray-100 :bg-gray-700 rounded-md">
                        <Download className="w-4 h-4" />
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
                <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 font-medium mb-1 uppercase tracking-wider text-xs">Original Prompt</p>
                  <p className="text-gray-900 leading-relaxed">{selectedSnippet.prompt}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => handleCopy(selectedSnippet.generatedCode)} className="btn-outline flex justify-center items-center gap-2">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} Copy Code
                  </button>
                  <button onClick={() => handleDownload(selectedSnippet)} className="btn-primary flex justify-center items-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
              
              <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-[#FAFAFA]">
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

export default Favorites;
