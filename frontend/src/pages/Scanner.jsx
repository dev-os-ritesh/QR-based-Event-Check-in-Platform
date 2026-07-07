import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getEvents } from "@/services/eventService";
import { checkInAttendee } from "@/services/registrationService";
import { showToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Scan, QrCode } from "lucide-react";

export default function Scanner() {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [scanResult, setScanResult] = useState(null);

  // ── Query: Fetch published events list using Service ────────────
  const { data: events } = useQuery({ 
    queryKey: ["events"], 
    queryFn: getEvents 
  });

  // ── Mutation: Send QR check-in payload using Service ─────────────
  const checkinMutation = useMutation({
    mutationFn: () => checkInAttendee({ qrCode, eventId: selectedEventId }),
    onSuccess: (data) => {
      setScanResult({ success: true, message: data.message, attendee: data.data });
      setQrCode(""); // Reset input field
      showToast(data.message, "success");
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Scan failed";
      setScanResult({ success: false, message: msg });
      showToast(msg, "error");
    },
  });

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <Card className="shadow-lg border-zinc-200/80 dark:border-zinc-800">
        <CardHeader className="flex flex-col items-center">
          <Scan className="size-10 text-indigo-600 dark:text-indigo-400 mb-2 animate-pulse" />
          <CardTitle className="text-2xl font-bold">Venue Ticket Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <option value="">Select Event to Scan For</option>
            {events?.map((e) => (
              <option key={e._id} value={e._id} className="text-black dark:text-white dark:bg-zinc-900">{e.title}</option>
            ))}
          </select>
          <div className="relative">
            <QrCode className="absolute left-3 top-2.5 size-4 text-zinc-400" />
            <Input placeholder="Paste/Type Ticket QR Code UUID" value={qrCode} onChange={(e) => setQrCode(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => checkinMutation.mutate()} disabled={!selectedEventId || !qrCode || checkinMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            {checkinMutation.isPending ? "Validating..." : "Simulate QR Scan"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Scan status result card with dynamic background colors ── */}
      {scanResult && (
        <Card className={`shadow-md border ${scanResult.success ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20" : "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"}`}>
          <CardContent className="p-6 text-center space-y-2">
            <h2 className={`text-xl font-bold ${scanResult.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>{scanResult.message}</h2>
            {scanResult.attendee && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Ticket: <span className="font-mono">{scanResult.attendee.ticketNumber}</span> • Checked in: {new Date(scanResult.attendee.checkedInAt).toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
