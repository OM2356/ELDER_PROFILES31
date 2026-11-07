import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TooltipProvider } from './context/TooltipContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { BuddyChat } from './components/chat/BuddyChat';
import { WellnessSection } from './components/wellness/WellnessSection';
import { DigitalEducation } from './components/education/DigitalEducation';
import { SafetyCenter } from './components/safety/SafetyCenter';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { SettingsView } from './components/settings/SettingsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SmartRemindersView } from './components/reminders/SmartRemindersView';
import { SocialEngagementView } from './components/social/SocialEngagementView';
import { EmergencyModal } from './components/emergency/EmergencyModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { Footer } from './components/common/Footer';

const MainContent: React.FC = () => {
  const { currentTab, highContrast, t } = useApp();

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-300">
      <div>
        <Header />
        <Navigation />

        <main role="main" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {currentTab === 'home' && <Dashboard />}
          {currentTab === 'chat' && <BuddyChat />}
          {currentTab === 'wellness' && <WellnessSection />}
          {currentTab === 'education' && <DigitalEducation />}
          {currentTab === 'safety' && <SafetyCenter />}
          {currentTab === 'family' && <CaregiverDashboard />}
          {currentTab === 'reminders' && <SmartRemindersView />}
          {currentTab === 'social' && <SocialEngagementView />}
          {currentTab === 'admin' && <AdminDashboard />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Accessible Comprehensive Footer */}
      <Footer />

      {/* Global Emergency Modal Dialog */}
      <EmergencyModal />

      {/* Personalized Senior Onboarding Wizard */}
      <OnboardingModal />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <MainContent />
      </TooltipProvider>
    </AppProvider>
  );
}
