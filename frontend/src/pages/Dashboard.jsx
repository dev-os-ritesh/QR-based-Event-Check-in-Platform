import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRegistrations, getRegistrationQR, downloadTicketPDFStream, cancelRegistration } from "@/services/registrationService";
import { showToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Ticket, QrCode, Download, X, AlertTriangle, Compass } from "lucide-react";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedQr, setSelectedQr] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [cancellingId, setCancellingId] = useState(null);

  // ── Query: Fetch logged-in user's event tickets ──────
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: getMyRegistrations,
  });

  // ── Mutation: Cancel registration ──
  const cancelMutation = useMutation({
    mutationFn: cancelRegistration,
    onSuccess: () => {
      showToast("Ticket cancelled successfully. Refund (if any) will be initiated! 💸", "success");
      queryClient.invalidateQueries(["my-registrations"]);
      setCancellingId(null);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || "Failed to cancel ticket. Please try again.", "error");
      setCancellingId(null);
    }
  });

  // ── Handle Download PDF ──────
  const handleDownload = async (registrationId, ticketNumber) => {
    try {
      const blob = await downloadTicketPDFStream(registrationId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket-${ticketNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Ticket PDF downloaded successfully! 📄", "success");
    } catch (err) {
      showToast("Failed to download PDF. Please try again.", "error");
    }
  };

  // ── Handle View QR ──────
  const handleViewQR = async (registrationId) => {
    try {
      const qrImage = await getRegistrationQR(registrationId);
      setSelectedQr(qrImage);
    } catch (err) {
      showToast("Failed to load QR code. Please try again.", "error");
    }
  };

  // ── Handle Cancellation Action ──────
  const handleCancelTicket = (registrationId) => {
    if (window.confirm("Are you sure you want to cancel this ticket? This action cannot be undone and will release your spot back to the event capacity.")) {
      setCancellingId(registrationId);
      cancelMutation.mutate(registrationId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-zinc-500 dark:text-zinc-400">
        <div className="size-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-semibold text-sm animate-pulse">Loading your tickets...</p>
      </div>
    );
  }

  // Filter tickets into tabs
  const now = new Date();
  const activeTickets = tickets?.filter(
    (t) => t.status === "registered" && new Date(t.event.date) >= now
  ) || [];

  const pastAndCancelledTickets = tickets?.filter(
    (t) => t.status === "cancelled" || t.status === "attended" || new Date(t.event.date) < now
  ) || [];

  const currentTabTickets = activeTab === "active" ? activeTickets : pastAndCancelledTickets;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Ticket className="size-8 text-indigo-600 dark:text-indigo-400" /> My Booked Tickets
        </h1>
        
        {/* Navigation Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl shadow-inner self-start sm:self-center">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "active"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Active Tickets ({activeTickets.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "past"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Past & Cancelled ({pastAndCancelledTickets.length})
          </button>
        </div>
      </div>

      {/* Tickets Display */}
      {currentTabTickets.length === 0 ? (
        <div className="text-center py-20 px-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
          <div className="inline-flex items-center justify-center size-14 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-2">
            <Compass className="size-7 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
            {activeTab === "active" ? "No active tickets" : "No past or cancelled tickets"}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto font-medium">
            {activeTab === "active"
              ? "You don't have any upcoming event bookings. Find some interesting events and book your spot!"
              : "Your ticket history is empty."}
          </p>
          {activeTab === "active" && (
            <Button 
              onClick={() => navigate("/")}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all"
            >
              Browse Upcoming Events
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {currentTabTickets.map((ticket) => {
            const isCancelled = ticket.status === "cancelled";
            const isAttended = ticket.status === "attended";
            const isPast = new Date(ticket.event.date) < now;

            return (
              <Card 
                key={ticket._id} 
                className={`overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 ${
                  (isCancelled || isPast) ? "opacity-75 dark:opacity-60" : ""
                }`}
              >
                {/* Header Section */}
                <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Ticket Number</span>
                    <p className="text-sm font-mono font-extrabold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md self-start inline-block">
                      {ticket.ticketNumber}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  {isCancelled ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                      Cancelled
                    </span>
                  ) : isAttended ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                      Checked In
                    </span>
                  ) : isPast ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Past Event
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      Active / Valid
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                    {ticket.event.title}
                  </h3>
                  
                  <div className="space-y-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-indigo-500 shrink-0" />
                      <span>
                        {new Date(ticket.event.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-indigo-500 shrink-0" />
                      <span>{ticket.event.location}</span>
                    </div>
                  </div>
                </CardContent>

                {/* Actions Footer */}
                {!isCancelled && !isPast && (
                  <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-4">
                    <Button 
                      onClick={() => handleCancelTicket(ticket._id)}
                      disabled={cancelMutation.isPending && cancellingId === ticket._id}
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <AlertTriangle className="size-3.5" /> 
                      {cancelMutation.isPending && cancellingId === ticket._id ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleViewQR(ticket._id)} 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-xs font-bold rounded-xl"
                      >
                        <QrCode className="size-3.5" /> View QR
                      </Button>
                      <Button 
                        onClick={() => handleDownload(ticket._id, ticket.ticketNumber)} 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-xs font-bold rounded-xl"
                      >
                        <Download className="size-3.5" /> PDF
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQr && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 backdrop-blur-sm">
          <Card className="w-full max-w-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center shadow-2xl rounded-3xl">
            <div className="w-full flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Your Entry QR Code</h3>
              <Button onClick={() => setSelectedQr(null)} variant="ghost" size="icon" className="size-8 rounded-full">
                <X className="size-4" />
              </Button>
            </div>
            
            <div className="p-4 bg-white border border-zinc-100 rounded-3xl shadow-inner">
              <img src={selectedQr} alt="QR Code" className="w-48 h-48 rounded-2xl" />
            </div>
            
            <p className="text-xs text-zinc-400 font-bold text-center mt-6 uppercase tracking-wider leading-relaxed">
              Show this QR code at the event gate <br />
              <span className="text-[10px] text-indigo-500 font-black">For seamless validation</span>
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
