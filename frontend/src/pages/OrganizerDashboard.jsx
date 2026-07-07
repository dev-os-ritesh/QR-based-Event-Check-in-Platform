import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getDashboardStats, getEventRegistrations } from "@/services/registrationService";
import { getOrganizerEvents, updateEvent } from "@/services/eventService";
import { showToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  PieChart, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Activity, 
  BookOpen, 
  Briefcase, 
  Laptop, 
  Music, 
  Trophy, 
  Tag, 
  Eye, 
  Ban, 
  Send 
} from "lucide-react";

export default function OrganizerDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchAttendee, setSearchAttendee] = useState("");
  const [updatingEventId, setUpdatingEventId] = useState(null);

  // ── Query: Fetch overview statistics ──
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["organizer-stats"],
    queryFn: getDashboardStats,
  });

  // ── Query: Fetch organizer's events ──
  const { data: myEvents, isLoading: isEventsLoading } = useQuery({
    queryKey: ["organizer-events"],
    queryFn: getOrganizerEvents,
    enabled: activeTab === "events",
  });

  // ── Query: Fetch registrations for expanded event ──
  const { data: attendees, isLoading: isAttendeesLoading } = useQuery({
    queryKey: ["event-registrations", selectedEventId],
    queryFn: () => getEventRegistrations(selectedEventId),
    enabled: !!selectedEventId,
  });

  // ── Mutation: Update event status ──
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateEvent(id, { status }),
    onSuccess: () => {
      showToast("Event status updated successfully! 🚀", "success");
      queryClient.invalidateQueries(["organizer-events"]);
      queryClient.invalidateQueries(["organizer-stats"]);
      setUpdatingEventId(null);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || "Failed to update event", "error");
      setUpdatingEventId(null);
    }
  });

  // ── Handlers ──
  const handleToggleStatus = (eventId, currentStatus) => {
    let nextStatus = "published";
    if (currentStatus === "published") {
      if (!window.confirm("Are you sure you want to cancel this event? This will stop new registrations and flag the event as cancelled.")) {
        return;
      }
      nextStatus = "cancelled";
    }
    setUpdatingEventId(eventId);
    updateStatusMutation.mutate({ id: eventId, status: nextStatus });
  };

  const toggleEventAttendees = (eventId) => {
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
    } else {
      setSelectedEventId(eventId);
      setSearchAttendee("");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "technology": return <Laptop className="size-4" />;
      case "music": return <Music className="size-4" />;
      case "sports": return <Trophy className="size-4" />;
      case "education": return <BookOpen className="size-4" />;
      case "business": return <Briefcase className="size-4" />;
      default: return <Tag className="size-4" />;
    }
  };

  if (isStatsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-zinc-500 dark:text-zinc-400">
        <div className="size-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-semibold text-sm animate-pulse">Loading dashboard stats...</p>
      </div>
    );
  }

  // Filter attendees by text search
  const filteredAttendees = attendees?.filter((a) => {
    const term = searchAttendee.toLowerCase();
    return (
      a.user.name.toLowerCase().includes(term) ||
      a.user.email.toLowerCase().includes(term) ||
      a.ticketNumber.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* Dashboard Title & Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <PieChart className="size-8 text-indigo-600 dark:text-indigo-400" /> Organizer Dashboard
        </h1>
        
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl shadow-inner self-start sm:self-center">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "overview"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Overview Stats
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "events"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            My Managed Events
          </button>
        </div>
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Total Bookings</CardTitle>
                <Users className="size-5 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-zinc-900 dark:text-white">{stats?.totalRegistrations}</div>
                <p className="text-xs text-zinc-500 mt-1 font-medium">Attendees registered across all events</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Check-Ins</CardTitle>
                <CheckSquare className="size-5 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-zinc-900 dark:text-white">{stats?.totalCheckins}</div>
                <p className="text-xs text-zinc-500 mt-1 font-medium">
                  Arrival Rate: <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{stats?.overallCheckInRate}%</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Published Events</CardTitle>
                <Calendar className="size-5 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-zinc-900 dark:text-white">{stats?.eventCounts?.published || 0}</div>
                <p className="text-xs text-zinc-500 mt-1 font-medium">
                  Drafts: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{stats?.eventCounts?.draft || 0}</span> • Cancelled: <span className="font-semibold text-red-500">{stats?.eventCounts?.cancelled || 0}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category distribution */}
          <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800 p-6 rounded-3xl bg-white dark:bg-zinc-900">
            <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2 tracking-tight text-zinc-900 dark:text-white">
              <Activity className="size-5 text-indigo-600 dark:text-indigo-400" /> Event Category Distribution
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stats?.eventsByCategory?.map((c) => (
                <div 
                  key={c.category} 
                  className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 rounded-2xl transition-all"
                >
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                    {getCategoryIcon(c.category)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="capitalize text-xs font-black text-zinc-400 uppercase tracking-wider">{c.category}</div>
                    <div className="text-lg font-extrabold text-zinc-800 dark:text-zinc-200">{c.count} event(s)</div>
                  </div>
                </div>
              ))}
              {(!stats?.eventsByCategory || stats.eventsByCategory.length === 0) && (
                <div className="col-span-full py-8 text-center text-sm font-semibold text-zinc-400">
                  No event records found. Switch to Managed Events and publish your first event!
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── MANAGED EVENTS TAB ──────────────────────────────────────── */}
      {activeTab === "events" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {isEventsLoading ? (
            <div className="text-center py-16 text-zinc-500 font-medium animate-pulse">Loading events...</div>
          ) : !myEvents || myEvents.length === 0 ? (
            <div className="text-center py-20 px-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
              <Calendar className="size-10 text-zinc-400 mx-auto" />
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No events created yet</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto font-medium">
                You haven't created any events. Go to the "Create Event" page in the navigation bar to start hosting.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {myEvents.map((event) => {
                const isExpanded = selectedEventId === event._id;
                
                return (
                  <Card 
                    key={event._id} 
                    className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Event Row Summary */}
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="capitalize flex items-center gap-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                            {getCategoryIcon(event.category)} {event.category}
                          </span>
                          
                          {/* Status Pill */}
                          {event.status === "draft" && (
                            <span className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Draft
                            </span>
                          )}
                          {event.status === "published" && (
                            <span className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Live / Published
                            </span>
                          )}
                          {event.status === "cancelled" && (
                            <span className="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Cancelled
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white leading-snug">
                          {event.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3.5 text-indigo-500" /> 
                            {new Date(event.date).toLocaleDateString("en-IN")}
                          </span>
                          <span>•</span>
                          <span>Capacity: {event.capacity} seats</span>
                          <span>•</span>
                          <span>Price: {event.ticketPrice > 0 ? `₹${event.ticketPrice}` : "Free"}</span>
                        </div>
                      </div>

                      {/* Organizer controls */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          onClick={() => toggleEventAttendees(event._id)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl flex items-center gap-1 text-xs font-bold"
                        >
                          <Eye className="size-3.5" /> 
                          {isExpanded ? "Hide Attendees" : "View Attendees"}
                          {isExpanded ? <ChevronUp className="size-3.5 ml-1" /> : <ChevronDown className="size-3.5 ml-1" />}
                        </Button>
                        
                        {event.status === "draft" && (
                          <Button
                            onClick={() => handleToggleStatus(event._id, "draft")}
                            disabled={updateStatusMutation.isPending && updatingEventId === event._id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-1 text-xs font-bold shadow-sm"
                          >
                            <Send className="size-3.5" /> 
                            {updateStatusMutation.isPending && updatingEventId === event._id ? "Publishing..." : "Publish Event"}
                          </Button>
                        )}
                        
                        {event.status === "published" && (
                          <Button
                            onClick={() => handleToggleStatus(event._id, "published")}
                            disabled={updateStatusMutation.isPending && updatingEventId === event._id}
                            variant="destructive"
                            size="sm"
                            className="rounded-xl flex items-center gap-1 text-xs font-bold shadow-sm"
                          >
                            <Ban className="size-3.5" /> 
                            {updateStatusMutation.isPending && updatingEventId === event._id ? "Cancelling..." : "Cancel Event"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Attendee Drilldown Drawer */}
                    {isExpanded && (
                      <div className="bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800/80 p-6 space-y-6">
                        
                        {/* Drawer Header Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <h4 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <Users className="size-4.5 text-indigo-600 dark:text-indigo-400" /> 
                            Attendee Roster ({filteredAttendees.length})
                          </h4>
                          
                          {/* Attendee Search Input */}
                          <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                            <input
                              type="text"
                              placeholder="Search name, email, ticket..."
                              value={searchAttendee}
                              onChange={(e) => setSearchAttendee(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500"
                            />
                            {searchAttendee && (
                              <button 
                                onClick={() => setSearchAttendee("")} 
                                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Roster Table */}
                        {isAttendeesLoading ? (
                          <div className="text-center py-8 text-zinc-400 text-xs font-medium animate-pulse">Loading attendee list...</div>
                        ) : filteredAttendees.length === 0 ? (
                          <div className="text-center py-10 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs text-zinc-400 font-bold">
                            {attendees?.length === 0 ? "No registrants yet for this event." : "No attendees match your search."}
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-zinc-100/80 dark:bg-zinc-900/60 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200/80 dark:border-zinc-800">
                                  <th className="p-4">Name</th>
                                  <th className="p-4">Email</th>
                                  <th className="p-4">Ticket Number</th>
                                  <th className="p-4">Registration Date</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4">Scan Time</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/40">
                                {filteredAttendees.map((reg) => (
                                  <tr key={reg._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                                    <td className="p-4 font-bold text-zinc-900 dark:text-white">{reg.user.name}</td>
                                    <td className="p-4">{reg.user.email}</td>
                                    <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{reg.ticketNumber}</td>
                                    <td className="p-4">{new Date(reg.createdAt).toLocaleDateString("en-IN")}</td>
                                    <td className="p-4">
                                      {reg.status === "cancelled" ? (
                                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-[10px] font-bold">Cancelled</span>
                                      ) : reg.checkedIn ? (
                                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-[10px] font-bold">Attended</span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 text-[10px] font-bold">Registered</span>
                                      )}
                                    </td>
                                    <td className="p-4 font-mono">
                                      {reg.checkedInAt 
                                        ? new Date(reg.checkedInAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) 
                                        : "—"
                                      }
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
