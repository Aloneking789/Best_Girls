'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { getSettings, updateSettings, Settings, SettingsUpdatePayload } from '@/lib/api';
import { Save, Loader } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState<SettingsUpdatePayload>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getSettings();
      setSettings(data);
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value,
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
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

            {loading && <div className="text-center py-12 text-muted-foreground">Loading settings...</div>}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                {error}
              </div>
            )}

            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                Settings saved successfully!
              </div>
            )}

            {!loading && settings && (
              <>
                {/* Tabs */}
                <div className="bg-white border border-border rounded-lg">
                  <div className="flex border-b border-border overflow-x-auto">
                    {[
                      { id: 'general', label: 'General Settings' },
                      { id: 'seo', label: 'SEO Settings' },
                      { id: 'social', label: 'Social Links' },
                      { id: 'scripts', label: 'Scripts & Embeds' },
                      { id: 'assets', label: 'Assets' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
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
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Website Name</label>
                          <input
                            type="text"
                            value={formData.websiteName || ''}
                            onChange={(e) => handleChange('websiteName', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Website Meta</label>
                          <textarea
                            value={formData.websiteMeta || ''}
                            onChange={(e) => handleChange('websiteMeta', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Contact Email</label>
                          <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                            <input
                              type="tel"
                              value={formData.phone || ''}
                              onChange={(e) => handleChange('phone', e.target.value)}
                              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                              disabled={saving}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">WhatsApp Number</label>
                            <input
                              type="tel"
                              value={formData.whatsappNumber || ''}
                              onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                              disabled={saving}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                          <textarea
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Google Maps Link</label>
                          <input
                            type="url"
                            value={formData.addressLink || ''}
                            onChange={(e) => handleChange('addressLink', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                            placeholder="https://maps.google.com/..."
                          />
                        </div>
                      </div>
                    )}

                    {/* SEO Settings */}
                    {activeTab === 'seo' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Meta Title</label>
                          <input
                            type="text"
                            value={formData.metaKeywords || ''}
                            onChange={(e) => handleChange('metaKeywords', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                          />
                          <p className="text-xs text-muted-foreground mt-1">60 characters recommended</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Meta Description</label>
                          <textarea
                            value={formData.metaDescription || ''}
                            onChange={(e) => handleChange('metaDescription', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground mt-1">150-160 characters recommended</p>
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    {activeTab === 'social' && (
                      <div className="space-y-4">
                        {Object.keys(formData.socialLinks || {}).map((platform) => (
                          <div key={platform}>
                            <label className="block text-sm font-medium text-foreground mb-2 capitalize">
                              {platform} URL
                            </label>
                            <input
                              type="url"
                              value={formData.socialLinks?.[platform as keyof typeof formData.socialLinks] || ''}
                              onChange={(e) => handleSocialChange(platform, e.target.value)}
                              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                              disabled={saving}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Scripts & Embeds */}
                    {activeTab === 'scripts' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Header Script</label>
                          <textarea
                            value={formData.headerScript || ''}
                            onChange={(e) => handleChange('headerScript', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 font-mono text-xs"
                            disabled={saving}
                            rows={6}
                            placeholder="Paste Google Analytics, GTM or other header scripts here..."
                          />
                          <p className="text-xs text-muted-foreground mt-1">Scripts to include in page header</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Footer Script</label>
                          <textarea
                            value={formData.footerScript || ''}
                            onChange={(e) => handleChange('footerScript', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 font-mono text-xs"
                            disabled={saving}
                            rows={6}
                            placeholder="Paste Intercom widget or other footer scripts here..."
                          />
                          <p className="text-xs text-muted-foreground mt-1">Scripts to include in page footer</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Map Embed</label>
                          <textarea
                            value={formData.mapEmbed || ''}
                            onChange={(e) => handleChange('mapEmbed', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 font-mono text-xs"
                            disabled={saving}
                            rows={6}
                            placeholder="Paste Google Maps embed code here..."
                          />
                          <p className="text-xs text-muted-foreground mt-1">Embed code for Google Maps</p>
                        </div>
                      </div>
                    )}

                    {/* Assets */}
                    {activeTab === 'assets' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Logo URL</label>
                          <input
                            type="url"
                            value={formData.logo || ''}
                            onChange={(e) => handleChange('logo', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                            placeholder="https://example.com/logo.svg"
                          />
                          {formData.logo && (
                            <img src={formData.logo} alt="Logo preview" className="mt-2 h-12 rounded" />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">White Logo URL</label>
                          <input
                            type="url"
                            value={formData.whiteLogo || ''}
                            onChange={(e) => handleChange('whiteLogo', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                            placeholder="https://example.com/logo-white.svg"
                          />
                          {formData.whiteLogo && (
                            <div className="mt-2 bg-black p-2 rounded inline-block">
                              <img src={formData.whiteLogo} alt="White logo preview" className="h-12 rounded" />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Favicon URL</label>
                          <input
                            type="url"
                            value={formData.favicon || ''}
                            onChange={(e) => handleChange('favicon', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            disabled={saving}
                            placeholder="https://example.com/favicon.ico"
                          />
                          {formData.favicon && (
                            <img src={formData.favicon} alt="Favicon preview" className="mt-2 h-6 rounded" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader size={20} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
