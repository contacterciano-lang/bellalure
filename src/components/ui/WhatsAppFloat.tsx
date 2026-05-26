'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppFloat() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8 mb-[env(safe-area-inset-bottom)]">
      {/* Offset above mobile nav on small screens */}
      <div className="mb-16 md:mb-0">
        <a
          href="https://wa.me/+33758167830"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Commander sur WhatsApp"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />

          {/* Button */}
          <motion.span
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30"
          >
            <MessageCircle className="h-7 w-7 text-white" strokeWidth={2} />
          </motion.span>

          {/* Tooltip */}
          <AnimatePresence>
            {hovered && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white shadow-lg"
              >
                Commander sur WhatsApp
              </motion.span>
            )}
          </AnimatePresence>
        </a>
      </div>
    </div>
  );
}
