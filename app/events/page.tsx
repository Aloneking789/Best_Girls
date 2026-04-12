'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, X, Star } from 'lucide-react';
import { Event, EventCreatePayload, EventUpdatePayload, getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/api';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(events.map(e => e.category)));

  const filteredEvents = events
    .filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCategory === 'All' || event.category === filterCategory)
    )
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handleAddEvent = async (formData: EventCreatePayload) => {
    try {
      setActionLoading(true);
      const newEvent = await createEvent(formData);
      setEvents([newEvent, ...events]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async (formData: EventUpdatePayload) => {
    if (selectedEvent) {
      try {
        setActionLoading(true);
        const updated = await updateEvent(selectedEvent.id, formData);
        setEvents(events.map(e => e.id === selectedEvent.id ? updated : e));
        setIsEditModalOpen(false);
        setSelectedEvent(null);
      } catch (err) {
        console.error('Error updating event:', err);
        alert('Failed to update event');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      setActionLoading(true);
      await deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event');
    } finally {
      setActionLoading(false);
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
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading events...</div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
            ) : null}

            {!loading && (
              <>
                {/* Table */}
                <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Event Title</th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Category</th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Dates</th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Venue</th>
                        <th className="text-center py-4 px-6 font-semibold text-foreground">Featured</th>
                        <th className="text-center py-4 px-6 font-semibold text-foreground">Active</th>
                        <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEvents.length > 0 ? (
                        paginatedEvents.map((event) => (
                          <tr key={event.id} className="border-b border-border hover:bg-muted transition-colors">
                            <td className="py-4 px-6 font-medium text-foreground">{event.title}</td>
                            <td className="py-4 px-6 text-muted-foreground">{event.category}</td>
                            <td className="py-4 px-6 text-muted-foreground text-xs">
                              {new Date(event.startAt).toLocaleDateString()} - {new Date(event.endAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 text-muted-foreground text-sm">{event.venue}</td>
                            <td className="py-4 px-6 text-center">
                              <Star size={18} className={event.isFeatured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${event.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {event.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(event)}
                                  disabled={actionLoading}
                                  className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(event.id)}
                                  disabled={actionLoading}
                                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 px-6 text-center text-muted-foreground">
                            No events found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {!loading && totalPages > 1 && (
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
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !actionLoading && setIsAddModalOpen(false)}
        title="Add New Event"
      >
        <EventForm onSubmit={handleAddEvent} onCancel={() => setIsAddModalOpen(false)} isLoading={actionLoading} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !actionLoading && setIsEditModalOpen(false)}
        title="Edit Event"
      >
        <EventForm
          initialData={selectedEvent || undefined}
          onSubmit={handleUpdateEvent}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={actionLoading}
        />
      </Modal>
    </div>
  );
}

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: EventCreatePayload | EventUpdatePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function EventForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || '',
    excerpt: initialData?.excerpt || '',
    description: initialData?.description || '',
    startAt: initialData?.startAt ? initialData.startAt.split('T')[0] : '',
    endAt: initialData?.endAt ? initialData.endAt.split('T')[0] : '',
    venue: initialData?.venue || '',
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive !== false,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>(initialData?.coverImage || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      ...(coverImageFile && { coverImage: coverImageFile }),
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Event Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Venue</label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Excerpt</label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={2}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
          <input
            type="date"
            value={formData.startAt}
            onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
          <input
            type="date"
            value={formData.endAt}
            onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Cover Image</label>
        {coverImagePreview && (
          <div className="mb-3 relative inline-block">
            <img src={coverImagePreview} alt="Preview" className="h-24 w-32 rounded-lg object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              disabled={isLoading}
            >
              <X size={14} />
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="rounded"
            disabled={isLoading}
          />
          <span className="text-sm font-medium text-foreground">Featured</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded"
            disabled={isLoading}
          />
          <span className="text-sm font-medium text-foreground">Active</span>
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add'} Event
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
