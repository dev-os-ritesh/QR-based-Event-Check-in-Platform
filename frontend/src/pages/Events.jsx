import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { getEvents } from "@/services/eventService";
import { registerForEvent } from "@/services/registrationService";
import { showToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  MapPin, 
  Calendar, 
  Tag, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Trophy, 
  Music, 
  Laptop, 
  BookOpen, 
  Briefcase, 
  Compass, 
  Users, 
  Clock, 
  QrCode, 
  CheckCircle2, 
  Ticket,
  ChevronDown
} from "lucide-react";

export default function Events() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [pendingEventId, setPendingEventId] = useState(null);

  // Sync category state from URL query parameter
  const setSelectedCategory = (cat) => {
    if (cat === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  // ── Query: Fetch all published events using Event Service ──────
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  // ── Mutation: Register for event using Registration Service ────
  const registerMutation = useMutation({
    mutationFn: registerForEvent,
    onSuccess: () => {
      showToast("Registered successfully! Check your email. 🎉", "success");
      queryClient.invalidateQueries(["my-registrations"]);
    },
    onError: (err) => showToast(err.response?.data?.message || "Registration failed", "error"),
    onSettled: () => setPendingEventId(null),
  });

  // ── Client Guard: Redirect unauthenticated bookings to login ──
  const handleRegister = (eventId) => {
    if (!user) {
      showToast("Please log in to register for events! 🔐", "error");
      navigate("/login");
      return;
    }
    setPendingEventId(eventId);
    registerMutation.mutate(eventId);
  };

  const getCategoryGradient = (category) => {
    switch (category) {
      case "technology":
        return "from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700";
      case "music":
        return "from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700";
      case "sports":
        return "from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700";
      case "education":
        return "from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700";
      case "business":
        return "from-amber-500 to-yellow-600 dark:from-amber-600 dark:to-yellow-700";
      default:
        return "from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "technology":
        return <Laptop className="size-3.5" />;
      case "music":
        return <Music className="size-3.5" />;
      case "sports":
        return <Trophy className="size-3.5" />;
      case "education":
        return <BookOpen className="size-3.5" />;
      case "business":
        return <Briefcase className="size-3.5" />;
      default:
        return <Tag className="size-3.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-zinc-500 dark:text-zinc-400">
        <div className="size-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-semibold text-sm animate-pulse">Loading events catalog...</p>
      </div>
    );
  }

  // Filter events based on search query and category parameter
  const filteredEvents = events?.filter((event) => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesSearch = 
      searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  // Sort events based on selected sorting
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sortBy === "price-asc") return a.ticketPrice - b.ticketPrice;
    if (sortBy === "price-desc") return b.ticketPrice - a.ticketPrice;
    return 0;
  });

  // Layout check: highlight the first event as featured only when viewing all events and there's no active search filter
  const showFeatured = selectedCategory === "all" && searchQuery === "" && sortedEvents.length >= 2;
  const featuredEvent = showFeatured ? sortedEvents[0] : null;
  const displayList = showFeatured ? sortedEvents.slice(1) : sortedEvents;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-16">
      
      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white shadow-2xl px-6 py-20 md:py-28 text-center transition-colors duration-300">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative max-w-3xl mx-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 animate-pulse">
            <Sparkles className="size-3.5" /> Next-Gen Ticket Check-In
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-indigo-200 bg-clip-text text-transparent">
            Unlocking Experiences <br />
            <span className="text-indigo-400">One QR At A Time</span>
          </h1>
          
          <p className="text-zinc-300 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Discover technology conferences, music shows, matches, and local workshops. Secure your contactless ticket instant scan dashboard.
          </p>

          {/* Search bar inside Hero */}
          <div className="relative max-w-xl mx-auto pt-4">
            <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200">
              <Search className="size-5 text-zinc-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search by event title, location, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none px-3 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:ring-0 py-2"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-bold px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors mr-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-y border-zinc-200/80 dark:border-zinc-800/80 py-8">
        <div className="space-y-1">
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">10k+</div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tickets Issued</div>
        </div>
        <div className="space-y-1 border-y md:border-y-0 md:border-x border-zinc-200/80 dark:border-zinc-800/80 py-4 md:py-0">
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Secure QR entry</div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">50+</div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Featured Organizers</div>
        </div>
      </section>

      {/* ── FILTER & SORT CONTROLS ───────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Events", icon: <Compass className="size-3.5" /> },
              { id: "technology", label: "Tech", icon: <Laptop className="size-3.5" /> },
              { id: "music", label: "Music", icon: <Music className="size-3.5" /> },
              { id: "sports", label: "Sports", icon: <Trophy className="size-3.5" /> },
              { id: "education", label: "Education", icon: <BookOpen className="size-3.5" /> },
              { id: "business", label: "Business", icon: <Briefcase className="size-3.5" /> },
              { id: "other", label: "Other", icon: <Tag className="size-3.5" /> },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
              <SlidersHorizontal className="size-3.5" /> Sort:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-1.5 pl-3 pr-8 text-xs font-bold focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-sm"
              >
                <option value="date-asc">Soonest Date</option>
                <option value="date-desc">Latest Date</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 size-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── EVENTS DISPLAY GRID ──────────────────────────────────────── */}
        {sortedEvents.length === 0 ? (
          <div className="text-center py-20 px-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
            <div className="inline-flex items-center justify-center size-14 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-2">
              <Compass className="size-7 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No events match your criteria</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              We couldn't find any events matching "{searchQuery}" under category "{selectedCategory}". Try clearing your search filters.
            </p>
            <Button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              variant="outline" 
              size="sm"
              className="mt-2 rounded-xl transition-all"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Featured Event Card (Spans across all columns) */}
            {showFeatured && featuredEvent && (
              <div className="col-span-1 md:col-span-3 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group">
                {/* Visual Banner side */}
                <div className={`w-full md:w-1/2 min-h-[260px] bg-gradient-to-br ${getCategoryGradient(featuredEvent.category)} relative flex flex-col justify-between p-6 text-white overflow-hidden`}>
                  {/* Pattern Layer */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start z-10">
                    <span className="bg-white/25 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      ★ Featured Event
                    </span>
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize">
                      {getCategoryIcon(featuredEvent.category)} {featuredEvent.category}
                    </span>
                  </div>
                  
                  <div className="z-10 mt-auto space-y-2">
                    <div className="text-xs text-indigo-100 flex items-center gap-1.5 font-semibold">
                      <Calendar className="size-4" /> {new Date(featuredEvent.date).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight group-hover:text-indigo-100 transition-colors">
                      {featuredEvent.title}
                    </h2>
                  </div>
                </div>
                
                {/* Content Side */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <Clock className="size-4 text-indigo-500" /> {featuredEvent.startTime} - {featuredEvent.endTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="size-4 text-indigo-500" /> {featuredEvent.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="size-4 text-indigo-500" /> Max Capacity: {featuredEvent.capacity}
                      </div>
                    </div>
                    
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-4">
                      {featuredEvent.description}
                    </p>
                    
                    {featuredEvent.tags && featuredEvent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {featuredEvent.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md font-semibold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Ticket Cost</span>
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {featuredEvent.ticketPrice > 0 ? `₹${featuredEvent.ticketPrice}` : "Free"}
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleRegister(featuredEvent._id)} 
                      disabled={registerMutation.isPending && pendingEventId === featuredEvent._id} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md px-6 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                    >
                      {registerMutation.isPending && pendingEventId === featuredEvent._id ? "Registering..." : "Register Now"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Event Cards */}
            {displayList.map((event) => (
              <Card key={event._id} className="flex flex-col justify-between overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 group rounded-3xl">
                
                {/* Header Gradient */}
                <div className={`h-36 bg-gradient-to-br ${getCategoryGradient(event.category)} relative flex flex-col justify-between p-5 text-white overflow-hidden`}>
                  {/* Dot Pattern */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start z-10">
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black capitalize shadow-sm">
                      {getCategoryIcon(event.category)} {event.category}
                    </span>
                    <span className="text-xs bg-white/25 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white font-black shadow-sm">
                      {event.ticketPrice > 0 ? `₹${event.ticketPrice}` : "Free"}
                    </span>
                  </div>
                  
                  <div className="z-10">
                    <div className="text-[10px] text-indigo-100 flex items-center gap-1 mb-1 font-bold">
                      <Calendar className="size-3.5" /> {new Date(event.date).toLocaleDateString("en-IN")}
                    </div>
                    <h3 className="font-extrabold text-lg line-clamp-1 leading-tight group-hover:text-indigo-100 transition-colors">
                      {event.title}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                      <div className="flex items-center gap-1 max-w-[70%]">
                        <MapPin className="size-4 text-zinc-400 shrink-0" /> 
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                        <Users className="size-4 shrink-0" /> Cap: {event.capacity}
                      </div>
                    </div>
                    
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {event.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md font-semibold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <Button 
                    onClick={() => handleRegister(event._id)} 
                    disabled={registerMutation.isPending && pendingEventId === event._id} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all duration-200 group-hover:shadow-md py-2 rounded-xl"
                  >
                    {registerMutation.isPending && pendingEventId === event._id ? "Registering..." : "Register Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS SECTION ──────────────────────────────────────── */}
      <section className="space-y-8 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-8 md:p-12 transition-colors duration-300">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">How TicketPass Works</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Get verified event access in three simple, fully automated steps.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="size-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Compass className="size-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">1. Find Your Event</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-medium">
              Browse conferences, workshops, concerts, and select your preferred event. Register with a single click.
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="size-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <QrCode className="size-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">2. Get Secure QR Ticket</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-medium">
              We generate a customized virtual ticket containing a unique encrypted QR code, accessible directly from your account.
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="size-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">3. Fast-Scan Entry</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-medium">
              Present your QR ticket at the venue gate. The organizer scans it via our scanner to verify your attendance instantly.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
