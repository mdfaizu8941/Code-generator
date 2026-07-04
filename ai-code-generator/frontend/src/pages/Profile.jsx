import { useContext, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, LogOut, Code2, Zap, Save, Clock, Settings, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalSnippets: 0, favoriteSnippets: 0 });

  useEffect(() => {
    // Fetch user snippet stats
    const fetchStats = async () => {
      try {
        const res = await api.get('/snippets?limit=1000');
        const snippets = res.data.data;
        setStats({
          totalSnippets: snippets.length,
          favoriteSnippets: snippets.filter(s => s.isFavorite).length
        });
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };
    fetchStats();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', { name, email });
      setUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Account Profile</h1>
        
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column - User Identity */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 dark:bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg shadow-primary/30 ring-4 ring-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center" title="Online"></div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-gray-500 dark:text-gray-500 font-medium mb-6">{user?.email}</p>
              
              <div className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" /> Account Verified
              </div>
              
              <button onClick={logout} className="flex items-center justify-center gap-2 w-full p-3 rounded-xl text-red-600 font-semibold bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </motion.div>
          </div>

          {/* Right Column - Stats & Settings */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Projects', value: stats.totalSnippets, icon: Code2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                { label: 'Favorites', value: stats.favoriteSnippets, icon: Save, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                { label: 'Tokens Used', value: '1.2M', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Usage Rank', value: 'Top 5%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((stat, i) => (
                <motion.div 
                  key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-900 dark:bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <div className={`p-3 rounded-full ${stat.bg} mb-3`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Profile Settings */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 dark:bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 dark:bg-gray-950/50 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleUpdate} className="space-y-5 max-w-2xl">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        className="input-field pl-11 bg-gray-50 dark:bg-gray-950" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email" 
                        className="input-field pl-11 bg-gray-50 dark:bg-gray-950" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end border-t border-gray-100 mt-6">
                    <button 
                      type="submit" 
                      className="btn-primary px-8 shadow-lg shadow-primary/30"
                      disabled={loading || (name === user?.name && email === user?.email)}
                    >
                      {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
            
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
