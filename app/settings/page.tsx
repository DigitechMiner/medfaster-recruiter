'use client';

import { Navbar } from '@/components/global/navbar';
import React, { useState } from 'react';

type ToggleEvent = { id: string; title: string; description: string; };
type NotificationCategory = { id: string; title: string; count: string; events: ToggleEvent[]; };

const notificationCategories: NotificationCategory[] = [
  {
    id: 'jobs-hiring',
    title: 'Jobs & Hiring Notifications',
    count: '5/5 Events',
    events: [
      { id: 'new-app', title: 'New Application', description: 'When candidate applies for a open job' },
      { id: 'interview', title: 'Interview', description: 'When candidate AI interview is completed for a open job' },
      { id: 'accepted-offer', title: 'Candidate Accepted Offer', description: 'When candidate accepts any urgent shifts & gets assigned for the shift' },
      { id: 'upcoming-job', title: 'Upcoming Job Schedule', description: 'When a upcoming job is going to be active within 24 hours the timer starts' },
      { id: 'active-job', title: 'Active Job Schedule', description: 'When a active job is going to start and before active job is going to end' },
    ]
  },
  {
    id: 'candidate-activity',
    title: 'Candidate Activity Notifications',
    count: '7/7 Events',
    events: [
      { id: 'checkin-checkout', title: 'Candidate Check-In & Check-Out', description: 'When any candidate Check-In and Check-Out for a active job' },
      { id: 'noshow', title: 'Candidate No-Show Alert', description: 'When candidate is failed to arrive for a job and not checked-in yet' },
      { id: 'late-arrival', title: 'Candidate Late Arrival', description: 'When candidate arrives late or is late Check-In' },
      { id: 'early-checkout', title: 'Candidate Early Checkout', description: 'When a candidate early Check-Out before the actual shift end time' },
      { id: 'shift-completed', title: 'Candidate Shift Completed', description: 'When a candidate successfully completes shift' },
      { id: 'new-match', title: 'New Candidate Match', description: "When KeRaeva's AI finds a candidate suitable for a specific job created" },
      { id: 'chat', title: 'Candidate Chat', description: 'If candidate sends a message over chat' },
    ]
  },
  {
    id: 'payments',
    title: 'Payments Notifications',
    count: '5/5 Events',
    events: [
      { id: 'payment-success', title: 'Payment Successfull & Wallet Updated', description: 'When a payment is deposited into wallet & payment is paid for a job or a candidate is paid for a completed job' },
      { id: 'payment-refunds', title: 'Payment Refunds', description: 'when a refund is processed into your wallet for a job' },
      { id: 'invoice-gen', title: 'Payment Invoice Generated', description: 'When a invoice is download ready' },
      { id: 'low-wallet', title: 'Low Wallet Balance', description: 'A notification alert will be given if youu wallet goes into low balance' },
      { id: 'payment-failure', title: 'Payment Failure', description: 'When a payment is failed due to some reasons' },
    ]
  }
];

const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-[#f47b20]' : 'bg-gray-200'
    }`}
  >
    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const defaultToggles = () => {
  const t: Record<string, boolean> = {};
  notificationCategories.forEach(cat => {
    t[cat.id] = true;
    cat.events.forEach(e => { t[e.id] = true; });
  });
  return t;
};

export default function SettingsPage() {
  const [openSection, setOpenSection] = useState<'general' | 'notifications' | null>('general');
  const [language, setLanguage] = useState<'English' | 'French'>('English');
  const [timezone, setTimezone] = useState('EDT (Eastern Daylight Time)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [savedTimezone, setSavedTimezone] = useState(timezone);
  const [savedDateFormat, setSavedDateFormat] = useState(dateFormat);
  const [savedLanguage, setSavedLanguage] = useState(language);

  const [toggles, setToggles] = useState<Record<string, boolean>>(defaultToggles);
  const [savedToggles, setSavedToggles] = useState<Record<string, boolean>>(defaultToggles);

  const generalIsDirty = language !== savedLanguage || timezone !== savedTimezone || dateFormat !== savedDateFormat;
  const notifIsDirty = JSON.stringify(toggles) !== JSON.stringify(savedToggles);

  const handleToggle = (id: string) => setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleAccordion = (section: 'general' | 'notifications') =>
    setOpenSection(openSection === section ? null : section);

  const handleGeneralReset = () => {
    setLanguage(savedLanguage);
    setTimezone(savedTimezone);
    setDateFormat(savedDateFormat);
  };

  const handleGeneralSave = () => {
    setSavedLanguage(language);
    setSavedTimezone(timezone);
    setSavedDateFormat(dateFormat);
    // Add API call here when endpoint is available
  };

  const handleNotifReset = () => setToggles(savedToggles);
  const handleNotifSave = () => {
    setSavedToggles({ ...toggles });
    // Add API call here when endpoint is available
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f8f7f5] p-6 text-gray-800 font-sans">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings & Configurations</h1>
            <p className="text-sm text-gray-500 mt-1">Configure portal rules and operational parameters</p>
          </div>

          <div className="space-y-4">

            {/* GENERAL SETTINGS */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => toggleAccordion('general')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-800">General Settings</span>
                <span className="text-gray-400 text-xl">{openSection === 'general' ? '−' : '+'}</span>
              </button>

              {openSection === 'general' && (
                <div className="p-6 border-t border-gray-200 bg-white space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Control</label>
                    <button className="px-8 py-2 rounded-md border-2 border-[#f47b20] bg-[#fdf2e9] text-[#f47b20] font-medium text-sm">
                      Admin Only
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                    <div className="flex rounded-md shadow-sm">
                      {(['English', 'French'] as const).map((lang, i) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`px-12 py-2 text-sm font-medium border ${i === 0 ? 'rounded-l-md' : 'rounded-r-md border-l-0'} ${
                            language === lang
                              ? 'border-[#f47b20] bg-[#fdf2e9] text-[#f47b20] z-10'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                      <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full border border-gray-300 rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#f47b20] focus:border-[#f47b20]">
                        <option>EDT (Eastern Daylight Time)</option>
                        <option>PST (Pacific Standard Time)</option>
                        <option>IST (Indian Standard Time)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time Format</label>
                      <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="w-full border border-gray-300 rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#f47b20] focus:border-[#f47b20]">
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-6">
                    <button onClick={handleGeneralReset} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Reset
                    </button>
                    <button
                      onClick={handleGeneralSave}
                      disabled={!generalIsDirty}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                        generalIsDirty
                          ? 'bg-[#f47b20] text-white hover:bg-[#d5650e] cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Save Changes
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* NOTIFICATIONS */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => toggleAccordion('notifications')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-800">Notifications Configurations</span>
                <span className="text-gray-400 text-xl">{openSection === 'notifications' ? '−' : '+'}</span>
              </button>

              {openSection === 'notifications' && (
                <div className="p-6 border-t border-gray-200 bg-white">
                  {notificationCategories.map((category, idx) => (
                    <div key={category.id} className={idx !== 0 ? "mt-10" : ""}>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">{category.title}</h3>
                            <span className="px-2 py-0.5 bg-[#fdf2e9] text-[#f47b20] text-xs font-medium rounded-full">{category.count}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Manage {category.title.replace('Notifications', '')} Notifications</p>
                        </div>
                        <Switch checked={toggles[category.id] ?? true} onChange={() => handleToggle(category.id)} />
                      </div>
                      <div className="space-y-4 pl-2">
                        {category.events.map(event => (
                          <div key={event.id} className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{event.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                            </div>
                            <Switch checked={toggles[event.id] ?? true} onChange={() => handleToggle(event.id)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
                    <button onClick={handleNotifReset} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Reset
                    </button>
                    <button
                      onClick={handleNotifSave}
                      disabled={!notifIsDirty}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                        notifIsDirty
                          ? 'bg-[#f47b20] text-white hover:bg-[#d5650e] cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Save Changes
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}