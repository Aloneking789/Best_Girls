'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import { Copy, Eye, EyeOff } from 'lucide-react';

export default function AIAssistantPage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('sk_test_1234567890');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedScript = `<iframe
  src="https://chat.yoursite.com/admission-bot"
  width="400"
  height="500"
  style="border: none; border-radius: 8px;"
></iframe>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Admissions & Leads', 'AI Admission Assistant']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-6">AI Admission Assistant</h1>

            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">Enable AI Assistant</h2>
                    <p className="text-muted-foreground">Activate or deactivate the AI admission chatbot</p>
                  </div>
                  <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      isEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* API Configuration */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">API Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">API Key</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={apiKey}
                          readOnly
                          className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground"
                        />
                      </div>
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="px-3 py-2 border border-border rounded-lg hover:bg-muted"
                      >
                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey)}
                        className="px-3 py-2 border border-border rounded-lg hover:bg-muted flex items-center gap-2"
                      >
                        <Copy size={18} /> {copied ? 'Copied' : ''}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Webhook URL</label>
                    <input
                      type="text"
                      value="https://yoursite.com/webhooks/admissions"
                      readOnly
                      className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Base URL</label>
                    <input
                      type="text"
                      value="https://api.aiadmissions.com/v1"
                      readOnly
                      className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Embed Script */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Embed Script</h2>
                <p className="text-sm text-muted-foreground mb-4">Copy this script to embed the AI assistant on your website</p>
                <div className="relative">
                  <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs border border-border">
                    <code>{embedScript}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(embedScript)}
                    className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Copy size={16} /> Copy
                  </button>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Internal Notes & Configuration</h2>
                <textarea
                  placeholder="Add internal notes about API configuration, test credentials, or setup details..."
                  rows={6}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 font-medium">
                  Save Configuration
                </button>
                <button className="flex-1 bg-muted text-foreground py-3 rounded-lg hover:bg-muted/80 font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
