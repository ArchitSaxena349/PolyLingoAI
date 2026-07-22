import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Clock, Plus, CheckCircle, Sparkles, Info } from 'lucide-react';
import { RiverService } from '../lib/integrations';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: 'hackathon' | 'showcase' | 'feedback' | 'workshop';
}

const DEFAULT_MOCK_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'PolyLingo AI Global Hackathon 2026',
    description: 'Build ground-breaking voice-enabled AI applications using PolyLingo builder and compete for $10,000 in API credits.',
    date: '2026-08-15',
    time: '18:00 UTC',
    location: 'Virtual Event (Discord / Zoom)',
    attendees: 142,
    type: 'hackathon'
  },
  {
    id: 'event-2',
    title: 'Multilingual Voice Agents Showcase',
    description: 'Community members present their real-time ElevenLabs voice cloning integrations and automated translation apps.',
    date: '2026-08-20',
    time: '15:00 UTC',
    location: 'Live Stream on YouTube',
    attendees: 89,
    type: 'showcase'
  },
  {
    id: 'event-3',
    title: 'Advanced AI App Architecture Workshop',
    description: 'Deep dive into state management, custom component building, and API integration best practices with PolyLingo core team.',
    date: '2026-08-28',
    time: '17:00 UTC',
    location: 'Virtual Workshop',
    attendees: 215,
    type: 'workshop'
  }
];

const CommunityEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [joinedEventIds, setJoinedEventIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'all' | 'joined'>('all');
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const toast = useToast();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'showcase' as Event['type']
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const loadJoinedEvents = async () => {
      if (!user) return;
      const storageKey = `polylingo-joined-events:${user.id}`;

      if (!supabase || user.id === 'demo-user-123') {
        try {
          setJoinedEventIds(new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')));
        } catch {
          setJoinedEventIds(new Set());
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', user.id);
        if (error) {
          setJoinedEventIds(new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')));
          return;
        }
        setJoinedEventIds(new Set((data || []).map((registration) => registration.event_id)));
      } catch {
        setJoinedEventIds(new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')));
      }
    };
    void loadJoinedEvents();
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const result = await new RiverService().getUpcomingEvents();
      if (Array.isArray(result?.events) && result.events.length > 0) {
        setEvents(result.events);
      } else {
        setEvents(DEFAULT_MOCK_EVENTS);
        setIsDemoMode(true);
      }
    } catch (error) {
      console.warn('River API fallback to mock events:', error);
      setEvents(DEFAULT_MOCK_EVENTS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.time || !newEvent.location.trim()) {
      toast.error('Please provide a title, date, time, and location.', 'Invalid Event');
      return;
    }

    try {
      let createdEvent: Event;
      if (!isDemoMode) {
        createdEvent = await new RiverService().createEvent(newEvent) as Event;
      } else {
        createdEvent = {
          ...newEvent,
          id: `event-${Date.now()}`,
          attendees: 1
        };
      }
      
      setEvents(prev => [createdEvent, ...prev]);
      setShowCreateForm(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'showcase'
      });
      toast.success('Community event created successfully.', 'Event Created');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Unable to create the event.', 'Event Error');
    }
  };

  const getEventTypeBadge = (type: Event['type']) => {
    switch (type) {
      case 'hackathon':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'showcase':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      case 'feedback':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'workshop':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  const handleJoinEvent = async (eventId: string, title: string) => {
    if (!user || joinedEventIds.has(eventId)) return;
    setJoiningEventId(eventId);
    try {
      const storageKey = `polylingo-joined-events:${user.id || 'demo'}`;
      const nextJoinedIds = new Set(joinedEventIds).add(eventId);
      localStorage.setItem(storageKey, JSON.stringify([...nextJoinedIds]));
      setJoinedEventIds(nextJoinedIds);

      if (supabase && user.id !== 'demo-user-123') {
        try {
          await supabase.from('event_registrations').insert({ event_id: eventId, user_id: user.id });
        } catch {
          // ignore DB sync failure in fallback mode
        }
      }

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === eventId ? { ...event, attendees: event.attendees + 1 } : event
        )
      );
      toast.success(`You joined "${title}".`, 'Event Joined');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join this event.', 'Join Failed');
    } finally {
      setJoiningEventId(null);
    }
  };

  const visibleEvents = view === 'joined' ? events.filter((event) => joinedEventIds.has(event.id)) : events;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-2">
            Community Events <Sparkles className="w-6 h-6 text-emerald-400" />
          </h2>
          <p className="text-slate-400 text-sm">
            Connect with other PolyLingo AI builders, showcase your apps, and participate in hackathons.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setView('all')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                view === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setView('joined')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                view === 'joined'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Events ({joinedEventIds.size})
            </button>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      </div>

      {isDemoMode && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>Viewing community hub in <strong>Interactive Demo Mode</strong> with pre-populated community events.</span>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Create New Community Event
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., AI Voice App Hackathon"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Event Type
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="showcase">Showcase</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="feedback">Feedback Session</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe your event..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Virtual or Location"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors"
                >
                  Create Event
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-3"></div>
          <p className="text-slate-400 text-xs font-medium">Loading community events…</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getEventTypeBadge(event.type)}`}>
                    {event.type}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    {event.attendees} attendees
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{event.title}</h3>
                <p className="text-slate-400 text-xs mb-6 line-clamp-3 min-h-[48px]">{event.description}</p>

                <div className="space-y-2 text-xs text-slate-400 mb-6 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>

              <button
                disabled={joinedEventIds.has(event.id) || joiningEventId === event.id}
                onClick={() => void handleJoinEvent(event.id, event.title)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  joinedEventIds.has(event.id)
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {joinedEventIds.has(event.id) ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-400" /> Joined
                  </>
                ) : joiningEventId === event.id ? (
                  'Joining…'
                ) : (
                  'Join Event'
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && view === 'joined' && visibleEvents.length === 0 && (
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Joined Events</h3>
          <p className="text-xs text-slate-400">You haven't registered for any community events yet.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityEvents;
