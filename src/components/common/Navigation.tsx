import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  Home,
  MessageSquareHeart,
  GraduationCap,
  Activity,
  Users,
  ShieldAlert,
  Settings,
  BarChart3,
  Clock,
  Sparkles,
} from 'lucide-react';

import { FeatureKey } from '../../utils/featureExplanations';
import { useTooltip } from '../../context/TooltipContext';
import { FeatureInfoButton } from './AccessibleTooltip';

import { useLongPress } from './AccessibleTooltip';

interface NavItem {
  id: NavigationTab;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  featureKey: FeatureKey;
}

const NavButton: React.FC<{
  item: NavItem;
  isActive: boolean;
  highContrast: boolean;
  onSelect: () => void;
  label: string;
}> = ({ item, isActive, highContrast, onSelect, label }) => {
  const { showTooltip } = useTooltip();
  const Icon = item.icon;

  const longPressHandlers = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip(item.featureKey),
    onClick: onSelect,
  });

  return (
    <div className="relative group inline-flex items-center flex-shrink-0">
      <button
        onClick={onSelect}
        {...longPressHandlers}
        className={`flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl min-h-[64px] min-w-[70px] md:min-w-[115px] font-bold transition-all cursor-pointer ${
          isActive
            ? highContrast
              ? 'bg-amber-400 text-black shadow-lg ring-4 ring-white'
              : 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-600 scale-[1.02]'
            : highContrast
            ? 'text-white border-2 border-slate-700 hover:border-amber-400 hover:bg-slate-900'
            : 'bg-white/90 text-slate-700 border-2 border-amber-200 hover:bg-amber-50 shadow-sm'
        }`}
        aria-current={isActive ? 'page' : undefined}
        aria-label={`${label}. Long press or tap info for explanation.`}
      >
        <Icon
          className={`w-6 h-6 md:w-7 md:h-7 ${
            isActive ? (highContrast ? 'text-black' : 'text-white') : 'text-amber-700'
          }`}
        />
        <span className="text-xs sm:text-sm md:text-base lg:text-lg font-extrabold whitespace-nowrap">
          {label}
        </span>
      </button>

      {/* Accessible Info button */}
      <div className="absolute -top-1.5 -right-1.5 z-10 opacity-70 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <FeatureInfoButton featureKey={item.featureKey} size="sm" variant={highContrast ? 'contrast' : 'badge'} />
      </div>
    </div>
  );
};

export const Navigation: React.FC = () => {
  const { currentTab, setCurrentTab, t, highContrast } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'home',
      labelKey: 'navHome',
      icon: Home,
      color: 'hover:bg-amber-100 hover:text-amber-900',
      featureKey: 'daily_checkin',
    },
    {
      id: 'chat',
      labelKey: 'navChat',
      icon: MessageSquareHeart,
      color: 'hover:bg-blue-100 hover:text-blue-900',
      featureKey: 'voice_chat',
    },
    {
      id: 'education',
      labelKey: 'navLearn',
      icon: GraduationCap,
      color: 'hover:bg-purple-100 hover:text-purple-900',
      featureKey: 'digital_learning',
    },
    {
      id: 'wellness',
      labelKey: 'navWellness',
      icon: Activity,
      color: 'hover:bg-emerald-100 hover:text-emerald-900',
      featureKey: 'fall_prevention',
    },
    {
      id: 'family',
      labelKey: 'navFamily',
      icon: Users,
      color: 'hover:bg-rose-100 hover:text-rose-900',
      featureKey: 'family_portal',
    },
    {
      id: 'safety',
      labelKey: 'navSafety',
      icon: ShieldAlert,
      color: 'hover:bg-orange-100 hover:text-orange-900',
      featureKey: 'safety_center',
    },
    {
      id: 'reminders',
      labelKey: 'navReminders',
      icon: Clock,
      color: 'hover:bg-amber-100 hover:text-amber-900',
      featureKey: 'nav_reminders',
    },
    {
      id: 'social',
      labelKey: 'navSocial',
      icon: Sparkles,
      color: 'hover:bg-purple-100 hover:text-purple-900',
      featureKey: 'nav_social',
    },
    {
      id: 'settings',
      labelKey: 'navSettings',
      icon: Settings,
      color: 'hover:bg-slate-200 hover:text-slate-900',
      featureKey: 'long_term_memory',
    },
    {
      id: 'admin',
      labelKey: 'navAdmin',
      icon: BarChart3,
      color: 'hover:bg-indigo-100 hover:text-indigo-900',
      featureKey: 'admin_portal',
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      className={`border-b-2 shadow-sm ${
        highContrast
          ? 'bg-black border-amber-400 text-white'
          : 'bg-amber-100/70 border-amber-200 text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Horizontal scroll on small devices, flex wrap on large */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto py-2.5 scrollbar-none">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentTab === item.id}
              highContrast={highContrast}
              onSelect={() => setCurrentTab(item.id)}
              label={t(item.labelKey)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};
