import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';

const API_URL = "https://script.google.com/macros/s/AKfycbzXOXrmmlaC3HCVpP4fi5VY1jNN9xIiiV3VqbqjmY2-JVY2Whg65VUFZGKt0cGHz4GY/exec";

const NewsTicker: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await fetch(API_URL, { 
          method: 'GET',
          redirect: 'follow' 
        });
        const data = await res.json();
        
        if (data && data.tickerMessages) {
          if (Array.isArray(data.tickerMessages)) {
            setMessages(data.tickerMessages);
          } else {
            const msgs = String(data.tickerMessages).split(';').map(s => s.trim()).filter(s => s.length > 0);
            setMessages(msgs);
          }
        }
      } catch (e) {
        console.warn("Ticker fetch failed:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicker();
  }, []);

  if (isLoading || messages.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mb-8 group relative z-[5]" dir="rtl">
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border-[3px] border-dashed border-[#6c5ce7]/40 rounded-2xl h-[60px] overflow-hidden relative shadow-sm transition-all hover:shadow-lg hover:border-[#6c5ce7] flex items-center">
        <div className="absolute left-4 z-10 text-[#6c5ce7]">
          <Megaphone className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 h-full relative overflow-hidden">
          <div className="absolute w-full animate-ticker-up group-hover:pause-animation">
            {/* Duplicating messages to ensure smooth infinite loop */}
            {[...messages, ...messages].map((msg, i) => (
              <React.Fragment key={i}>
                <div className="h-[60px] flex items-center justify-center px-12 text-center">
                  <span className="text-lg md:text-xl font-black text-gray-700 dark:text-slate-200 truncate">
                    {msg}
                  </span>
                </div>
                <div className="h-[2px] w-1/3 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-neon-line" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;