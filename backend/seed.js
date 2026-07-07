const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Event = require("./models/Event");
const User = require("./models/User");

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB database.");

    // Find all events with title containing "Grand Developer Summit"
    const summits = await Event.find({ title: /Grand Developer Summit/i });
    console.log(`Found ${summits.length} Grand Developer Summit events.`);

    let keptEvent = null;

    if (summits.length > 0) {
      // Find the one with capacity 100
      keptEvent = summits.find(s => s.capacity === 100);

      // If none found with capacity 100, keep the first one and we'll update it
      if (!keptEvent) {
        keptEvent = summits[0];
        keptEvent.capacity = 100;
        await keptEvent.save();
        console.log(`No event had 100 capacity. Kept first one and updated capacity to 100.`);
      } else {
        console.log(`Found event with 100 capacity: ${keptEvent._id}`);
      }

      // Delete the other summits
      for (const s of summits) {
        if (s._id.toString() !== keptEvent._id.toString()) {
          await Event.deleteOne({ _id: s._id });
          console.log(`Deleted duplicate event: ${s._id}`);
        }
      }
    } else {
      console.log("No Grand Developer Summit found. We will create one.");
    }

    // Find an organizer to link the new events to
    let organizer = null;
    if (keptEvent) {
      organizer = keptEvent.organizer;
    } else {
      // Find any user with role 'organizer'
      organizer = await User.findOne({ role: "organizer" });
    }

    if (!organizer) {
      // Find any user
      organizer = await User.findOne({});
    }

    if (!organizer) {
      console.error("No users found in database to assign as organizer! Please register a user first.");
      process.exit(1);
    }

    // Resolve organizer ID
    const organizerId = organizer._id || organizer;
    console.log(`Using organizer ID: ${organizerId}`);

    // If keptEvent doesn't exist, create the 100 capacity Grand Developer Summit event
    if (!keptEvent) {
      keptEvent = await Event.create({
        title: "Grand Developer Summit 2026",
        description: "The ultimate gathering for professional developers, engineers, and tech visionaries. Join us for 3 days of deep-dives into AI, Cloud architectures, and next-gen frontend engineering.",
        location: "Silicon Valley Convention Center, CA",
        date: new Date("2026-10-15"),
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        capacity: 100,
        ticketPrice: 4999,
        category: "technology",
        status: "published",
        organizer: organizerId,
        tags: ["AI", "Cloud", "Vite", "React"]
      });
      console.log("Created Grand Developer Summit with 100 capacity.");
    }

    // Now let's create a list of different events in various categories
    const newEvents = [
      {
        title: "Neon Symphony: Electronic Music Fest",
        description: "Experience the magic of light and sound. Live sets from top electronic artists, interactive light installations, and dance areas.",
        location: "Vibrant Arena, Mumbai",
        date: new Date("2026-08-20"),
        startTime: "06:00 PM",
        endTime: "11:30 PM",
        capacity: 500,
        ticketPrice: 1499,
        category: "music",
        status: "published",
        organizer: organizerId,
        tags: ["EDM", "Concert", "Nightlife"]
      },
      {
        title: "National Football Championship",
        description: "Watch the country's top clubs battle it out for the ultimate championship trophy. Food trucks, fan zones, and live half-time show.",
        location: "Salt Lake Stadium, Kolkata",
        date: new Date("2026-09-05"),
        startTime: "04:00 PM",
        endTime: "07:30 PM",
        capacity: 1000,
        ticketPrice: 499,
        category: "sports",
        status: "published",
        organizer: organizerId,
        tags: ["Football", "Tournament", "Match"]
      },
      {
        title: "Web3 & Blockchain Seminar",
        description: "Understand the fundamentals of decentralized applications, smart contracts security, and how to build scalable products in Web3.",
        location: "Nasscom Startup Hub, Bangalore",
        date: new Date("2026-07-28"),
        startTime: "10:00 AM",
        endTime: "02:00 PM",
        capacity: 80,
        ticketPrice: 0, // Free event
        category: "technology",
        status: "published",
        organizer: organizerId,
        tags: ["Web3", "Blockchain", "Solidity"]
      },
      {
        title: "Startup Founders Roundtable",
        description: "Connect with angel investors, VC firms, and successful scale-up founders. Get feedback on your pitch deck and share startup growth hacks.",
        location: "WeWork Galaxy, Bangalore",
        date: new Date("2026-11-12"),
        startTime: "03:00 PM",
        endTime: "06:00 PM",
        capacity: 120,
        ticketPrice: 999,
        category: "business",
        status: "published",
        organizer: organizerId,
        tags: ["Startup", "Funding", "Networking"]
      },
      {
        title: "Creative Painting Masterclass",
        description: "Learn professional acrylic painting techniques from renowned canvas artists. All art supplies, canvases, and drinks are provided.",
        location: "Artisans Studio, Pune",
        date: new Date("2026-08-10"),
        startTime: "11:00 AM",
        endTime: "02:00 PM",
        capacity: 25,
        ticketPrice: 1999,
        category: "other",
        status: "published",
        organizer: organizerId,
        tags: ["Art", "Workshop", "Painting"]
      }
    ];

    for (const e of newEvents) {
      // Check if event already exists to avoid duplicates
      const exists = await Event.findOne({ title: e.title });
      if (!exists) {
        await Event.create(e);
        console.log(`Created new event: ${e.title}`);
      } else {
        console.log(`Event already exists: ${e.title}`);
      }
    }

    console.log("Database clean up and seeding completed successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Error during database operation:", error);
    process.exit(1);
  }
};

run();
