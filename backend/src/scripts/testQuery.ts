import mongoose from 'mongoose';
import { connectDatabase } from '../config/db';
import { User } from '../modules/auth/entities/user';
import { Job } from '../modules/job/entities/job';
import { JobRepository } from '../modules/job/repositories/jobRepository';

const test = async () => {
  console.log("Connecting to database...");
  await connectDatabase();

  try {
    // 1. Get or create an employer
    let employer = await User.findOne({ role: 'employer' });
    if (!employer) {
      employer = new User({
        phoneNumber: '+91 99990 99999',
        role: 'employer',
        preferredLanguage: 'en'
      });
      await employer.save();
    }

    // 2. Clear old jobs
    await Job.deleteMany({});
    console.log("Cleared old jobs.");

    // 3. Create test jobs
    const jobsData = [
      {
        employerId: employer._id,
        title: "Noida Electrician Needed",
        description: "Need an electrician in Sector 62 Noida",
        tradeCategory: "electrician" as const,
        location: {
          type: "Point" as const,
          coordinates: [77.3718, 28.6273] // Sector 62 Noida
        },
        address: "Sector 62, Noida, UP",
        salaryRange: "₹15,000 - ₹20,000",
        jobType: "gig" as const,
        requiredSkills: ["Wiring"],
        status: "open" as const
      },
      {
        employerId: employer._id,
        title: "Delhi Carpenter Needed",
        description: "Need a carpenter in Connaught Place New Delhi",
        tradeCategory: "carpenter" as const,
        location: {
          type: "Point" as const,
          coordinates: [77.2167, 28.6304] // Connaught Place Delhi
        },
        address: "Connaught Place, New Delhi",
        salaryRange: "₹20,000 - ₹25,000",
        jobType: "full-time" as const,
        requiredSkills: ["Furniture"],
        status: "open" as const
      },
      {
        employerId: employer._id,
        title: "Bangalore Plumber Needed",
        description: "Need a plumber in MG Road Bangalore",
        tradeCategory: "plumber" as const,
        location: {
          type: "Point" as const,
          coordinates: [77.5946, 12.9716] // Bangalore MG Road
        },
        address: "MG Road, Bangalore, Karnataka",
        salaryRange: "₹18,000 - ₹22,000",
        jobType: "contract" as const,
        requiredSkills: ["Piping"],
        status: "open" as const
      }
    ];

    await Job.insertMany(jobsData);
    console.log("Seeded 3 test jobs.");

    // Amit Sharma's coordinates: Indirapuram Ghaziabad [77.3712, 28.6366]
    const userLon = 77.3712;
    const userLat = 28.6366;

    const repo = new JobRepository();

    console.log("\n--- TEST 1: Search Radius = 50 Km ---");
    const jobs50km = await repo.findNearby(userLon, userLat, 50 * 1000);
    console.log(`Found ${jobs50km.length} jobs inside 50 km.`);
    jobs50km.forEach((job: any) => {
      console.log(`- ${job.title} | Address: ${job.address} | Distance: ${(job.distance / 1000).toFixed(2)} Km`);
    });

    console.log("\n--- TEST 2: Search Radius = No Range (-1 Km) ---");
    const jobsNoRange = await repo.findNearby(userLon, userLat, -1000);
    console.log(`Found ${jobsNoRange.length} jobs.`);
    jobsNoRange.forEach((job: any) => {
      console.log(`- ${job.title} | Address: ${job.address} | Distance: ${(job.distance / 1000).toFixed(2)} Km`);
    });

  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
};

test();
