import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Building2, 
  CreditCard, 
  Settings, 
  Shield,
  BarChart3,
  Brain
} from 'lucide-react';

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminNavigation = ({ activeTab, onTabChange }: AdminNavigationProps) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'publishers', label: 'Publishers', icon: Building2 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'ai', label: 'AI Config', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {navItems.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default AdminNavigation;
