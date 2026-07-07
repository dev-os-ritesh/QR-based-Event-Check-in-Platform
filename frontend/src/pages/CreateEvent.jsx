import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "@/services/eventService";
import { showToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarPlus, MapPin, Calendar, Users, DollarSign } from "lucide-react";

export default function CreateEvent() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "", description: "", location: "", date: "",
    startTime: "", endTime: "", capacity: 100, ticketPrice: 0,
    category: "technology", status: "published",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Mutation: Send form data to create a new event using Service ──
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      showToast("Event created and published successfully! 🎉", "success");
      queryClient.invalidateQueries(["events"]); // Refresh events cache
      setFormData({
        title: "", description: "", location: "", date: "",
        startTime: "", endTime: "", capacity: 100, ticketPrice: 0,
        category: "technology", status: "published",
      });
    },
    onError: (err) => showToast(err.response?.data?.message || "Failed to create event", "error"),
  });

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card className="shadow-lg border-zinc-200/80 dark:border-zinc-800 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-col items-center">
          <CalendarPlus className="size-10 text-indigo-600 dark:text-indigo-400 mb-2" />
          <CardTitle className="text-2xl font-bold text-center">Publish New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
            <Input name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} required />
            <Input name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 size-4 text-zinc-400" />
              <Input name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="pl-9" required />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
              <Input name="startTime" placeholder="Start Time" value={formData.startTime} onChange={handleChange} required />
              <Input name="endTime" placeholder="End Time" value={formData.endTime} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Users className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                <Input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} className="pl-9" required />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                <Input type="number" name="ticketPrice" placeholder="Price (₹)" value={formData.ticketPrice} onChange={handleChange} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              {createMutation.isPending ? "Creating..." : "Publish Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
