import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server, ServerOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { api } from '../utils/api';

export function BackendStatus() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline' | 'fallback'>('checking');
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await api.healthCheck();
        if (response.status === 'ok') {
          setBackendStatus(response.mode === 'fallback' ? 'fallback' : 'online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    // Check backend health on mount
    checkBackendHealth();

    // Show status temporarily
    setShowStatus(true);
    const timer = setTimeout(() => setShowStatus(false), 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!showStatus || backendStatus === 'checking') {
    return null;
  }

  const getStatusConfig = () => {
    switch (backendStatus) {
      case 'online':
        return {
          icon: Server,
          text: 'Backend connected',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'fallback':
        return {
          icon: AlertCircle,
          text: 'Using offline mode',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default:
        return {
          icon: ServerOff,
          text: 'Backend unavailable',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
    }
  };

  const { icon: Icon, text, className } = getStatusConfig();

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-16 left-4 right-4 z-40 flex justify-center"
    >
      <Badge className={`flex items-center gap-2 px-3 py-2 ${className}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm">{text}</span>
      </Badge>
    </motion.div>
  );
}