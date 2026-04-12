'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { getInquiries, deleteInquiry, updateInquiry, Inquiry, InquiryUpdatePayload } from '@/lib/api';
import { Trash2, Search, Mail, Download } from 'lucide-react';

export default function LeadsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getInquiries();
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = Array.from(new Set(inquiries.map(i => i.status)));

  const filteredInquiries = inquiries
    .filter(inquiry =>
      (inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.courseInterest.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus === 'All' || inquiry.status === filterStatus)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const pendingCount = inquiries.filter(i => i.status === 'PENDING').length;

  const handleView = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedInquiry) return;
    try {
      setActionLoading(true);
      const updated = await updateInquiry(selectedInquiry.id, { status });
      setInquiries(inquiries.map(i => i.id === selectedInquiry.id ? updated : i));
      setSelectedInquiry(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inquiry');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      setActionLoading(true);
      await deleteInquiry(id);
      setInquiries(inquiries.filter(i => i.id !== id));
      if (selectedInquiry?.id === id) {
        setIsViewModalOpen(false);
        setSelectedInquiry(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inquiry');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Contact Inquiries' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Contact Inquiries</h1>
                <p className="text-muted-foreground mt-1">Manage incoming course inquiries and contact requests</p>
              </div>
              <div className="flex items-center gap-4">
                {pendingCount > 0 && (
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold">
                    {pendingCount} Pending
                  </div>
                )}
              </div>
            </div>

            {loading && <div className="text-center py-12 text-muted-foreground">Loading inquiries...</div>}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm mb-6">
                {error}
              </div>
            )}

            {/* Filters */}
            {!loading && (
              <div className="bg-white border border-border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      placeholder="Search by name, email, or course..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="All">All Inquiries</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Table */}
            {!loading && filteredInquiries.length > 0 && (
              <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Email</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Course Interest</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Phone</th>
                      <th className="text-center py-4 px-6 font-semibold text-foreground">Status</th>
                      <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className={`border-b border-border transition-colors ${inquiry.status === 'PENDING' ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-muted'}`}>
                        <td className={`py-4 px-6 font-medium ${inquiry.status === 'PENDING' ? 'text-yellow-900 font-bold' : 'text-foreground'}`}>
                          {inquiry.name}
                        </td>
                        <td className="py-4 px-6 text-muted-foreground text-xs">{inquiry.email}</td>
                        <td className="py-4 px-6 text-muted-foreground text-sm">{inquiry.courseInterest}</td>
                        <td className="py-4 px-6 text-muted-foreground text-sm">{inquiry.phone}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${inquiry.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                            }`}>
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(inquiry)}
                              disabled={actionLoading}
                              className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                              title="View Details"
                            >
                              <Mail size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(inquiry.id)}
                              disabled={actionLoading}
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
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
            )}

            {!loading && filteredInquiries.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No inquiries found</div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
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
                      className={`px-3 py-2 rounded-lg ${currentPage === page
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
      {selectedInquiry && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedInquiry(null);
          }}
          title="Inquiry Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="block text-foreground mb-1">Name</strong>
                <span className="text-muted-foreground">{selectedInquiry.name}</span>
              </div>
              <div>
                <strong className="block text-foreground mb-1">Email</strong>
                <span className="text-muted-foreground text-xs">{selectedInquiry.email}</span>
              </div>
              <div>
                <strong className="block text-foreground mb-1">Phone</strong>
                <span className="text-muted-foreground">{selectedInquiry.phone}</span>
              </div>
              <div>
                <strong className="block text-foreground mb-1">Course Interest</strong>
                <span className="text-muted-foreground">{selectedInquiry.courseInterest}</span>
              </div>
            </div>

            <div>
              <strong className="block text-foreground mb-1 text-sm">Message</strong>
              <div className="bg-muted p-3 rounded-lg text-sm text-foreground">{selectedInquiry.message}</div>
            </div>

            {selectedInquiry.documentUrl && (
              <div>
                <strong className="block text-foreground mb-2 text-sm">Attached Document</strong>
                <a
                  href={selectedInquiry.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <Download size={16} /> View Document
                </a>
              </div>
            )}

            <div>
              <strong className="block text-foreground mb-2 text-sm">Status</strong>
              <div className="flex gap-2">
                {['PENDING', 'RESOLVED'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={actionLoading}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${selectedInquiry.status === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {status === 'PENDING' ? '⏳ Pending' : '✓ Resolved'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleReply(selectedInquiry.email)}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Reply via Email
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedInquiry(null);
                }}
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
