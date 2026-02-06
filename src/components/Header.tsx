import { Bell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const Header = ({ title, showLogo = false }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {showLogo ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">🚐</span>
            <span className="font-display font-bold text-xl text-gradient-sunset">
              Roadmigo
            </span>
          </motion.div>
        ) : (
          <h1 className="font-display font-bold text-lg">{title}</h1>
        )}

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
