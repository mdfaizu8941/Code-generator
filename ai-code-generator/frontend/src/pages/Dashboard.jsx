import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Editor from '@monaco-editor/react';
import { Play, Copy, Download, Save, Check, Code2, Terminal, Eye, FileText, Settings2, Zap, BarChart3, Clock, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { downloadZip, downloadFile } from '../utils/exportUtils';

const languages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'sql', name: 'SQL' },
];

const frameworks = [
  { id: 'none', name: 'None (Vanilla)' },
  { id: 'react', name: 'React' },
  { id: 'nextjs', name: 'Next.js' },
  { id: 'express', name: 'Express' },
  { id: 'django', name: 'Django' },
];



const Dashboard = () => {
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.template?.prompt || '');
  const [language, setLanguage] = useState(location.state?.template?.language || 'javascript');
  const [framework, setFramework] = useState(location.state?.template?.framework || 'none');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const [activeTemplate, setActiveTemplate] = useState(location.state?.template || null);
  const textareaRef = useRef(null);

  // Sync state if navigating from Templates page with new template data
  useEffect(() => {
    if (location.state?.template) {
      const { template } = location.state;
      setPrompt(template.prompt || '');
      setLanguage(template.language || 'javascript');
      setFramework(template.framework || 'none');
      setActiveTemplate(template);
      setGeneratedCode('');
      
      // Focus and smoothly scroll to the textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100); // small delay to ensure render
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to generate');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedCode('');
    
    try {
      const res = await api.post('/generate', { prompt, language, framework });
      let code = res.data.data;
      code = code.replace(/```[a-z]*\n/gi, '').replace(/```/g, '');
      setGeneratedCode(code);
      toast.success('Code generated successfully!');
      setActiveTab('code');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!generatedCode) return;
    const title = prompt.split(' ').slice(0, 5).join(' ') + '...';
    try {
      await api.post('/snippets', { title, prompt, language, framework, generatedCode });
      toast.success('Snippet saved to history!');
    } catch (error) {
      toast.error('Failed to save snippet');
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    if (['react', 'nextjs', 'express'].includes(framework)) {
      downloadZip(generatedCode, language, 'AI_Project').catch(() => toast.error('Failed to zip'));
    } else {
      downloadFile(generatedCode, `generated_code.${language === 'python' ? 'py' : 'js'}`);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-6">
        
        {/* Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          {[
            { label: 'Generated Today', value: '12', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100' },
            { label: 'Saved Snippets', value: '48', icon: Save, color: 'text-blue-500', bg: 'bg-blue-100' },
            { label: 'Tokens Used', value: '124K', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-100' },
            { label: 'Time Saved', value: '14h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-100' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Workspace Grid */}
        <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">
          
          {/* Left Column - Prompt & Settings */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="card-container flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                <Settings2 className="w-5 h-5 mr-2 text-primary" />
                Generation Setup
              </h2>
              
              {activeTemplate && (
                <div className="mb-4 flex items-center justify-between bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-blue-900">Using Template: {activeTemplate.title}</span>
                  </div>
                  <button 
                    onClick={() => setActiveTemplate(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                className="input-field flex-1 resize-none mb-6 text-gray-700 leading-relaxed min-h-[150px]"
                placeholder="Describe the application you want to build... (e.g. A REST API for a todo list)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Language</label>
                  <select 
                    className="input-field cursor-pointer bg-gray-50"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Framework</label>
                  <select 
                    className="input-field cursor-pointer bg-gray-50"
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                  >
                    {frameworks.map(fw => (
                      <option key={fw.id} value={fw.id}>{fw.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-lg shadow-lg shadow-primary/30"
              >
                {isGenerating ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Thinking...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" /> Generate Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Editor & Output */}
          <div className="lg:col-span-8 card-container flex flex-col p-0 overflow-hidden">
            
            {/* Editor Tabs & Toolbar */}
            <div className="h-14 border-b border-gray-100 bg-gray-50 flex items-center justify-between px-2 shrink-0">
              <div className="flex items-center space-x-1">
                {[
                  { id: 'code', icon: Code2, label: 'Code' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-white   text-primary shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500  hover:text-gray-900 :text-white  hover:bg-gray-100 :bg-gray-700 '
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-1 pr-2">
                <button onClick={handleCopy} disabled={!generatedCode} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition disabled:opacity-50" title="Copy">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={handleSave} disabled={!generatedCode} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition disabled:opacity-50" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={handleDownload} disabled={!generatedCode} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition disabled:opacity-50" title="Download">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Editor Content Area */}
            <div className="flex-1 relative bg-[#FAFAFA]">
              <AnimatePresence>
                {isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white backdrop-blur-sm z-10"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 animate-pulse"></div>
                      <Code2 className="w-16 h-16 text-primary relative z-10 animate-bounce" />
                    </div>
                    <p className="mt-6 text-gray-600 font-medium text-lg tracking-wide">Architecting your solution...</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {activeTab === 'code' && (
                <Editor
                  height="100%"
                  language={language === 'c++' ? 'cpp' : language}
                  theme="vs-light"
                  value={generatedCode || '// Write a prompt and click Generate to see the magic...'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 15,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    wordWrap: 'on',
                    readOnly: false,
                    padding: { top: 24, bottom: 24 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                  }}
                />
              )}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
