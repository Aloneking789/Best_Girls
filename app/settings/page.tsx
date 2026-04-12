'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Save, Upload } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'My College',
    siteTagline: 'Excellence in Education',
    contactEmail: 'info@college.edu',
    phone: '+91-9876543210',
    address: '123 Education Lane, City, State 123456',
  });

  const [seoSettings, setSeoSettings] = useState({
    defaultTitle: 'My College - Excellence in Education',
    defaultDescription: 'Leading institution for higher education',
    keywords: 'college, university, education',
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com/college',
    twitter: 'https://twitter.com/college',
    instagram: 'https://instagram.com/college',
    linkedin: 'https://linkedin.com/college',
    youtube: 'https://youtube.com/college',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    senderEmail: 'noreply@college.edu',
    senderName: 'My College',
  });

  const handleGeneralChange = (field: string, value: string) => {
    setGeneralSettings({ ...generalSettings, [field]: value });
  };

  const handleSeoChange = (field: string, value: string) => {
    setSeoSettings({ ...seoSettings, [field]: value });
  };

  const handleSocialChange = (field: string, value: string) => {
    setSocialLinks({ ...socialLinks, [field]: value });
  };

  const handleEmailChange = (field: string, value: string) => {
    setEmailSettings({ ...emailSettings, [field]: value });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Settings' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">Configure your college website and application settings</p>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-border rounded-lg">
              <div className="flex border-b border-border">
                {[
                  { id: 'general', label: 'General Settings' },
                  { id: 'seo', label: 'SEO Settings' },
                  { id: 'social', label: 'Social Links' },
                  { id: 'email', label: 'Email Configuration' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    {/* Logo Upload */}
                    <div className="border border-dashed border-border rounded-lg p-8 text-center hover:bg-muted transition-colors cursor-pointer">
                      <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
                      <h3 className="font-medium text-foreground mb-1">Upload Logo</h3>
                      <p className="text-sm text-muted-foreground">PNG, JPG or GIF (max 2MB)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Site Name</label>
                        <input
                          type="text"
                          value={generalSettings.siteName}
                          onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Tagline</label>
                        <input
                          type="text"
                          value={generalSettings.siteTagline}
                          onChange={(e) => handleGeneralChange('siteTagline', e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) => handleGeneralChange('contactEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                      <input
                        type="tel"
                        value={generalSettings.phone}
                        onChange={(e) => handleGeneralChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                      <textarea
                        value={generalSettings.address}
                        onChange={(e) => handleGeneralChange('address', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* SEO Settings */}
                {activeTab === 'seo' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Default Page Title</label>
                      <input
                        type="text"
                        value={seoSettings.defaultTitle}
                        onChange={(e) => handleSeoChange('defaultTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-1">60 characters recommended</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Default Meta Description</label>
                      <textarea
                        value={seoSettings.defaultDescription}
                        onChange={(e) => handleSeoChange('defaultDescription', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">150-160 characters recommended</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Keywords</label>
                      <input
                        type="text"
                        value={seoSettings.keywords}
                        onChange={(e) => handleSeoChange('keywords', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Separate with commas"
                      />
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {activeTab === 'social' && (
                  <div className="space-y-4">
                    {Object.entries(socialLinks).map(([platform, url]) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-foreground mb-2 capitalize">
                          {platform} URL
                        </label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleSocialChange(platform, e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Email Configuration */}
                {activeTab === 'email' && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
                      Configure your SMTP settings for sending emails from your college website.
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">SMTP Server</label>
                        <input
                          type="text"
                          value={emailSettings.smtpServer}
                          onChange={(e) => handleEmailChange('smtpServer', e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">SMTP Port</label>
                        <input
                          type="text"
                          value={emailSettings.smtpPort}
                          onChange={(e) => handleEmailChange('smtpPort', e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Sender Email</label>
                      <input
                        type="email"
                        value={emailSettings.senderEmail}
                        onChange={(e) => handleEmailChange('senderEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Sender Name</label>
                      <input
                        type="text"
                        value={emailSettings.senderName}
                        onChange={(e) => handleEmailChange('senderName', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <button className="w-full border border-border rounded-lg px-4 py-2 text-foreground hover:bg-muted transition-colors">
                      Test Email Configuration
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={20} /> Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
