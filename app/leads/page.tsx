'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Filter, Mail } from 'lucide-react';

interface ContactLead {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  isRead: boolean;
  submittedDate: string;
}

const leadsData: ContactLead[] = [
  { id: 1, name: 'John Smith', email: 'john@example.com', phone: '9876543210', subject: 'Course Inquiry', message: 'Interested in B.Tech program', source: 'Website', isRead: true, submittedDate: '2024-04-10' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '9876543211', subject: 'Admission Help', message: 'Need help with application process', source: 'Phone', isRead: false, submittedDate: '2024-04-10' },
  { id: 3, name: 'Mike Davis', email: 'mike@example.com', phone: '9876543212', subject: 'Fees Query', message: 'What are the payment options?', source: 'Email', isRead: false, submittedDate: '2024-04-09' },
  { id: 4, name: 'Emma Wilson', email: 'emma@example.com', phone: '9876543213', subject: 'Placement Info', message: 'Career opportunities?', source: 'Website', isRead: true, submittedDate: '2024-04-09' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<ContactLead[]>(leadsData);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRead, setFilterRead] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLeads = leads
    .filter(lead =>
      (lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.email.includes(searchQuery)) &&
      (filterRead === 'All' || (filterRead === 'Unread' && !lead.isRead) || (filterRead === 'Read' && lead.isRead))
    )
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const unreadCount = leads.filter(l => !l.isRead).length;

  const handleView = (lead: ContactLead) => {
    setSelectedLead(lead);
    if (!lead.isRead) {
      setLeads(leads.map(l => l.id === lead.id ? { ...l, isRead: true } : l));
    }
    setIsViewModalOpen(true);
  };

  const toggleRead = (id: number) => {
    setLeads(leads.map(lead =>
      lead.id === id ? { ...lead, isRead: !lead.isRead } : lead
    ));
  };

  const handleDelete = (id: number) => {
    setLeads(leads.filter(lead => lead.id !== id));
  };

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Contact Leads' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Contact Leads</h1>
                <p className="text-muted-foreground mt-1">Manage incoming contact inquiries and leads</p>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">
                    {unreadCount} Unread
                  </div>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  value={filterRead}
                  onChange={(e) => {
                    setFilterRead(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Messages</option>
                  <option value="Unread">Unread</option>
                  <option value="Read">Read</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Subject</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Source</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((lead) => (
                    <tr key={lead.id} className={`border-b border-border transition-colors ${lead.isRead ? 'hover:bg-muted' : 'bg-blue-50 hover:bg-blue-100'}`}>
                      <td className={`py-4 px-6 font-medium ${lead.isRead ? 'text-foreground' : 'text-blue-900 font-bold'}`}>
                        {lead.name}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-xs">{lead.email}</td>
                      <td className="py-4 px-6 text-muted-foreground">{lead.subject}</td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{lead.source}</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleRead(lead.id)}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            lead.isRead
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {lead.isRead ? 'Read' : 'Unread'}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(lead)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Mail size={18} />
                          </button>
                          <button
                            onClick={() => handleReply(lead.email)}
                            className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                            title="Reply"
                          >
                            <Mail size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Modal */}
      {selectedLead && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Lead Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="block text-foreground mb-1">Name</strong>
                <span className="text-muted-foreground">{selectedLead.name}</span>
              </div>
              <div>
                <strong className="block text-foreground mb-1">Email</strong>
                <span className="text-muted-foreground">{selectedLead.email}</span>
              </div>
              <div>
                <strong className="block text-foreground mb-1">Phone</strong>
                <span className="text-muted-foreground">{selectedLead.phone}</span>
              </div>
              <div>
                <strong className="block text-foreground mb-1">Source</strong>
                <span className="text-muted-foreground">{selectedLead.source}</span>
              </div>
            </div>

            <div>
              <strong className="block text-foreground mb-1 text-sm">Subject</strong>
              <span className="text-muted-foreground text-sm">{selectedLead.subject}</span>
            </div>

            <div>
              <strong className="block text-foreground mb-2 text-sm">Message</strong>
              <div className="bg-muted p-3 rounded-lg text-sm text-foreground">{selectedLead.message}</div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleReply(selectedLead.email)}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reply via Email
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
