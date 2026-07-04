import { useState, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Moon, Sun, Monitor, Bell, Shield, Key, CreditCard, Laptop, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
    marketing: false
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-500">Manage your workspace preferences and account configurations.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-primary font-semibold rounded-lg">
              <Laptop className="w-5 h-5" /> Preferences
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-950 font-medium rounded-lg transition-colors">
              <Bell className="w-5 h-5" /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-950 font-medium rounded-lg transition-colors">
              <Shield className="w-5 h-5" /> Privacy
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-950 font-medium rounded-lg transition-colors">
              <Key className="w-5 h-5" /> API Keys
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-950 font-medium rounded-lg transition-colors">
              <CreditCard className="w-5 h-5" /> Billing
            </button>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Appearance Section */}
            <div className="bg-white dark:bg-gray-900 dark:bg-white rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 dark:bg-gray-950/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appearance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Customize how CodeGen AI looks on your device.</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 max-w-lg">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all ${theme === 'light' ? 'border-primary bg-blue-50 dark:bg-blue-900/30/50' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:border-gray-700'}`}
                  >
                    <Sun className={`w-8 h-8 mb-3 ${theme === 'light' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 text-sm">Light Mode</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all ${theme === 'dark' ? 'border-primary bg-blue-50 dark:bg-blue-900/30/50' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:border-gray-700'}`}
                  >
                    <Moon className={`w-8 h-8 mb-3 ${theme === 'dark' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 text-sm">Dark Mode</span>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all ${theme === 'system' ? 'border-primary bg-blue-50 dark:bg-blue-900/30/50' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:border-gray-700'}`}
                  >
                    <Monitor className={`w-8 h-8 mb-3 ${theme === 'system' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 text-sm">System</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Preferences Section */}
            <div className="bg-white dark:bg-gray-900 dark:bg-white rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 dark:bg-gray-950/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Editor Preferences</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Manage your Monaco Editor settings.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-700">Font Family</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-500">The font used in the code editor.</p>
                  </div>
                  <select className="input-field w-48 text-sm cursor-pointer">
                    <option>JetBrains Mono</option>
                    <option>Fira Code</option>
                    <option>Consolas</option>
                    <option>Source Code Pro</option>
                  </select>
                </div>
                
                <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-700">Word Wrap</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Wrap long lines to fit the editor width.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-900 dark:bg-white after:border-gray-300 dark:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-700">Minimap</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Show the code minimap overview on the right side.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-900 dark:bg-white after:border-gray-300 dark:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleSave} className="btn-primary px-8 shadow-lg shadow-primary/30 flex items-center gap-2">
                <Save className="w-5 h-5" /> Save All Settings
              </button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
