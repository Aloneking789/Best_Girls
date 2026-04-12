'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Filter, Calendar } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  category: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: string;
  isFeatured: boolean;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

const eventsData: Event[] = [
  { id: 1, title: 'Tech Summit 2024', category: 'Seminar', startDate: '2024-05-15', startTime: '09:00', endDate: '2024-05-15', endTime: '17:00', venue: 'Main Auditorium', isFeatured: true, status: 'Upcoming' },
  { id: 2, title: 'Sports Day', category: 'Sports', startDate: '2024-04-20', startTime: '08:00', endDate: '2024-04-20', endTime: '18:00', venue: 'Sports Ground', isFeatured: true, status: 'Upcoming' },
  { id: 3, title: 'Annual Fest', category: 'Cultural', startDate: '2024-04-25', startTime: '10:00', endDate: '2024-04-27', endTime: '22:00', venue: 'Campus Grounds', isFeatured: false, status: 'Upcoming' },
  { id: 4, title: 'Workshop: AI & ML', category: 'Workshop', startDate: '2024-04-18', startTime: '14:00', endDate: '2024-04-18', endTime: '16:00', venue: 'Room 101', isFeatured: false, status: 'Ongoing' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(eventsData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredEvents = events
    .filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterStatus === 'All' || event.status === filterStatus)
    )
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'Ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const toggleFeatured = (id: number) => {
    setEvents(events.map(event =>
      event.id === id ? { ...event, isFeatured: !event.isFeatured } : event
    ));
  };

  const handleAddEvent = (formData: any) => {
    const newEvent: Event = {
      id: Math.max(...events.map(e => e.id), 0) + 1,
      ...formData,
      isFeatured: false,
    };
    setEvents([newEvent, ...events]);
    setIsAddModalOpen(false);
  };

  const handleUpdateEvent = (formData: any) => {
    if (selectedEvent) {
      setEvents(events.map(event =>
        event.id === selectedEvent.id
          ? { ...event, ...formData }
          : event
      ));
      setIsEditModalOpen(false);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Events' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Events</h1>
                <p className="text-muted-foreground mt-1">Manage all campus events and activities</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} /> Add Event
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search events..."
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
                  <option value="All">All Status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Event Title</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Category</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Date & Time</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Venue</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Featured</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvents.map((event) => (
                    <tr key={event.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{event.title}</td>
                      <td className="py-4 px-6 text-muted-foreground">{event.category}</td>
                      <td className="py-4 px-6 text-muted-foreground text-xs">{event.startDate} {event.startTime}</td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{event.venue}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleFeatured(event.id)}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold transition-colors ${event.isFeatured
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                          {event.isFeatured ? '⭐ Featured' : 'Not Featured'}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
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

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Event"
      >
        <EventForm onSubmit={handleAddEvent} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Event"
      >
        <EventForm
          initialData={selectedEvent || undefined}
          onSubmit={handleUpdateEvent}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function EventForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Event;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || '',
    startDate: initialData?.startDate || '',
    startTime: initialData?.startTime || '',
    endDate: initialData?.endDate || '',
    endTime: initialData?.endTime || '',
    venue: initialData?.venue || '',
    status: initialData?.status || 'Upcoming',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Event Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select</option>
            <option value="Seminar">Seminar</option>
            <option value="Workshop">Workshop</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Academic">Academic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Upcoming' | 'Ongoing' | 'Completed' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Start Time</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">End Time</label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Venue</label>
        <input
          type="text"
          value={formData.venue}
          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Event
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
