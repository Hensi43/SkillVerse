import mongoose from 'mongoose';
import { connectDatabase } from '../config/db';
import { User } from '../modules/auth/entities/user';
import { Worker } from '../modules/worker/entities/worker';

const mockWorkers = [
  {
    fullName: "Rajesh Kumar",
    phoneNumber: "+91 99990 00001",
    tradeCategory: "electrician" as const,
    experienceYears: 5,
    gender: "male",
    address: "Sector 62, Noida, UP",
    coordinates: [77.3718, 28.6273] as [number, number], // Sector 62, Noida
    skills: ["House Wiring", "Inverter Repair", "Appliance Install"],
    verifiedBadges: [{ badgeName: "Verified Electrician Expert", score: 88, verifiedAt: new Date() }],
    rating: 4.8,
    reviewCount: 12
  },
  {
    fullName: "Sunil Dutt",
    phoneNumber: "+91 99990 00002",
    tradeCategory: "plumber" as const,
    experienceYears: 3,
    gender: "male",
    address: "Sector 18, Noida, UP",
    coordinates: [77.3259, 28.5708] as [number, number], // Sector 18, Noida
    skills: ["Pipe Leak Repair", "Taps and Showers", "Drain Cleaning"],
    verifiedBadges: [{ badgeName: "Verified Plumber Professional", score: 82, verifiedAt: new Date() }],
    rating: 4.6,
    reviewCount: 8
  },
  {
    fullName: "Amit Sharma",
    phoneNumber: "+91 99990 00003",
    tradeCategory: "electrician" as const,
    experienceYears: 8,
    gender: "male",
    address: "Indirapuram, Ghaziabad, UP",
    coordinates: [77.3712, 28.6366] as [number, number], // Indirapuram, Ghaziabad
    skills: ["Industrial Wiring", "Generator Maintenance", "Panel Board Work"],
    verifiedBadges: [{ badgeName: "Verified Electrician Expert", score: 94, verifiedAt: new Date() }],
    rating: 4.9,
    reviewCount: 24
  },
  {
    fullName: "Ramesh Chand",
    phoneNumber: "+91 99990 00004",
    tradeCategory: "carpenter" as const,
    experienceYears: 6,
    gender: "male",
    address: "Vaishali, Ghaziabad, UP",
    coordinates: [77.3400, 28.6400] as [number, number], // Vaishali, Ghaziabad
    skills: ["Furniture Assembly", "Door and Window Repair", "Cabinet Making"],
    verifiedBadges: [{ badgeName: "Verified Carpenter Master", score: 90, verifiedAt: new Date() }],
    rating: 4.7,
    reviewCount: 15
  },
  {
    fullName: "Vikram Singh",
    phoneNumber: "+91 99990 00005",
    tradeCategory: "delivery" as const,
    experienceYears: 2,
    gender: "male",
    address: "Sector 15, Noida, UP",
    coordinates: [77.3115, 28.5786] as [number, number], // Sector 15, Noida
    skills: ["Bike Delivery", "Navigating Noida Routes", "Customer Handling"],
    verifiedBadges: [{ badgeName: "Verified Delivery Agent", score: 85, verifiedAt: new Date() }],
    rating: 4.5,
    reviewCount: 9
  },
  {
    fullName: "Sanjay Jha",
    phoneNumber: "+91 99990 00006",
    tradeCategory: "housekeeping" as const,
    experienceYears: 4,
    gender: "male",
    address: "Sector 137, Noida, UP",
    coordinates: [77.4024, 28.5034] as [number, number], // Sector 137, Noida
    skills: ["Office Cleaning", "Deep Home Sweeping", "Sanitization Services"],
    verifiedBadges: [{ badgeName: "Verified Housekeeper Specialist", score: 80, verifiedAt: new Date() }],
    rating: 4.4,
    reviewCount: 6
  },
  {
    fullName: "Deepak Verma",
    phoneNumber: "+91 99990 00007",
    tradeCategory: "driver" as const,
    experienceYears: 10,
    gender: "male",
    address: "Connaught Place, New Delhi",
    coordinates: [77.2167, 28.6304] as [number, number], // Connaught Place, New Delhi
    skills: ["Commercial Driving", "Sedan and SUV Specialist", "Night Driving"],
    verifiedBadges: [{ badgeName: "Verified Driver Pro", score: 96, verifiedAt: new Date() }],
    rating: 5.0,
    reviewCount: 42
  },
  {
    fullName: "Rahul Gowda",
    phoneNumber: "+91 99990 00008",
    tradeCategory: "plumber" as const,
    experienceYears: 5,
    gender: "male",
    address: "MG Road, Bangalore, Karnataka",
    coordinates: [77.5946, 12.9716] as [number, number], // MG Road, Bangalore
    skills: ["Bathroom Renovations", "High Pressure Piping", "Solar Heater Repair"],
    verifiedBadges: [{ badgeName: "Verified Plumber Expert", score: 89, verifiedAt: new Date() }],
    rating: 4.8,
    reviewCount: 16
  }
];

const seed = async () => {
  console.log("Connecting to database for seeding...");
  await connectDatabase();

  try {
    for (const data of mockWorkers) {
      console.log(`Processing seed for ${data.fullName}...`);

      const existingUser = await User.findOne({ phoneNumber: data.phoneNumber });
      if (existingUser) {
        await Worker.deleteOne({ userId: existingUser._id });
        await User.deleteOne({ _id: existingUser._id });
        console.log(`Cleared existing mock user ${data.phoneNumber}`);
      }

      const user = new User({
        phoneNumber: data.phoneNumber,
        role: 'worker',
        preferredLanguage: 'en'
      });
      const savedUser = await user.save();

      const worker = new Worker({
        userId: savedUser._id,
        fullName: data.fullName,
        gender: data.gender,
        tradeCategory: data.tradeCategory,
        experienceYears: data.experienceYears,
        address: data.address,
        location: {
          type: 'Point',
          coordinates: data.coordinates
        },
        skills: data.skills,
        verifiedBadges: data.verifiedBadges,
        rating: data.rating,
        reviewCount: data.reviewCount
      });
      await worker.save();
      console.log(`Successfully seeded worker profile for ${data.fullName}`);
    }
    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

seed();
