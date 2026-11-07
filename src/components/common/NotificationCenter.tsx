import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Clock,
  Sparkles,
  Users,
  AlertTriangle,
  GraduationCap,
  ShieldAlert,
  Moon,
} from 'lucide-react';
import { useTooltip } from '../../context/TooltipContext';
import { useLongPress } from './AccessibleTooltip';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    clearAllNotifications,
    setCurrentTab,
    language,
    highContrast,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'wellness' | 'safety'>('all');
  const [quietHours, setQuietHours] = useState(false);
  const { showTooltip } = useTooltip();

  const longPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('notification_center'),
    onClick: () => setIsOpen((prev) => !prev),
  });

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'wellness') return n.category === 'wellness';
    if (filter === 'safety') return n.category === 'safety' || n.category === 'emergency';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'wellness':
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
      case 'learning':
        return <GraduationCap className="w-5 h-5 text-purple-500" />;
      case 'family':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'safety':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        {...longPress}
        className={`relative min-h-[50px] min-w-[50px] px-3 py-2 rounded-xl border-2 font-bold flex items-center justify-center transition-all cursor-pointer ${
          highContrast
            ? 'bg-black text-amber-400 border-amber-400 hover:bg-zinc-900'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
        }`}
        aria-label={`Notification center. ${unreadNotificationsCount} unread notifications. Long press for explanation.`}
        title="Notification Center (Long press for explanation)"
      >
        <Bell className="w-6 h-6 text-amber-600" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white shadow-md animate-pulse">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Dropdown Modal Panel */}
      {isOpen && (
        <div
          className={`fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-96 md:w-[420px] rounded-3xl p-5 shadow-2xl border-4 z-50 max-h-[85vh] flex flex-col ${
            highContrast
              ? 'bg-black text-white border-amber-400'
              : 'bg-white text-slate-900 border-amber-400'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Notification Center"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">
                  {language === 'hi'
                    ? 'सूचना केंद्र'
                    : language === 'mr'
                    ? 'सूचना केंद्र'
                    : 'Smart Notifications'}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {unreadNotificationsCount}{' '}
                  {language === 'hi' ? 'नई सूचनाएं' : language === 'mr' ? 'नवीन सूचना' : 'unread updates'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              aria-label="Close notifications"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Filter & Quiet Hours */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${
                  filter === 'all'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${
                  filter === 'unread'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('wellness')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${
                  filter === 'wellness'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Wellness
              </button>
              <button
                onClick={() => setFilter('safety')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${
                  filter === 'safety'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Safety
              </button>
            </div>

            <button
              onClick={() => setQuietHours(!quietHours)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                quietHours
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Quiet Hours (suppresses non-emergency sound alerts)"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{quietHours ? 'Quiet On' : 'Quiet Off'}</span>
            </button>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[350px]">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCheck className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="font-bold text-base">
                  {language === 'hi'
                    ? 'कोई सूचना नहीं है। सब कुछ सुरक्षित है!'
                    : language === 'mr'
                    ? 'कोणतीही सूचना नाही. सर्व सुरक्षित आहे!'
                    : 'No notifications. Everything is peaceful!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                    !n.read
                      ? highContrast
                        ? 'bg-zinc-900 border-amber-400 text-white'
                        : 'bg-amber-50/70 border-amber-300'
                      : highContrast
                      ? 'bg-black border-zinc-800 text-zinc-400'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">{getCategoryIcon(n.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-base font-extrabold leading-snug truncate ${
                          !n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600'
                        }`}
                      >
                        {n.title}
                      </h4>
                      <span className="text-xs font-semibold text-slate-500 flex-shrink-0">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed opacity-90">
                      {n.message}
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      {n.actionTab && (
                        <button
                          onClick={() => {
                            setCurrentTab(n.actionTab as any);
                            setIsOpen(false);
                            markNotificationRead(n.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                        >
                          View
                        </button>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between">
              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-red-600 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
