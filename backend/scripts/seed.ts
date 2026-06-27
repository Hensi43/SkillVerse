import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/modules/auth/entities/user';
import { Worker } from '../src/modules/worker/entities/worker';
import { Job } from '../src/modules/job/entities/job';
import { Application } from '../src/modules/job/entities/application';

const MONGO_URI = 'mongodb://localhost:27017/skillverse';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Worker.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    // Hash a common password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create 1 Employer
    const employer = await User.create({
      email: 'employer@example.com',
      passwordHash,
      name: 'Acme Construction',
      role: 'employer',
      preferredLanguage: 'en'
    });
    console.log('Created employer:', employer.email);

    // Create 3 Workers
    const workersData = [
      { email: 'electrician@example.com', name: 'Rajesh Kumar', trade: 'electrician', loc: [77.37, 28.62] },
      { email: 'plumber@example.com', name: 'Ramesh Singh', trade: 'plumber', loc: [77.38, 28.61] },
      { email: 'carpenter@example.com', name: 'Suresh Wood', trade: 'carpenter', loc: [77.36, 28.63] }
    ];

    const workers = [];
    for (const w of workersData) {
      const user = await User.create({
        email: w.email,
        passwordHash,
        name: w.name,
        role: 'worker',
        preferredLanguage: 'en'
      });

      const workerProfile = await Worker.create({
        userId: user._id,
        fullName: user.name,
        tradeCategory: w.trade,
        location: { type: 'Point', coordinates: w.loc },
        address: 'Noida, UP',
        experienceYears: Math.floor(Math.random() * 10) + 1,
        verifiedBadges: [{ badgeName: `${w.trade} Basics`, score: 90, verifiedAt: new Date() }],
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 20) + 1
      });

      workers.push(workerProfile);
      console.log('Created worker:', user.email);
    }

    // Create 5 Jobs
    const jobsData = [
      { title: 'Senior Electrician Needed', trade: 'electrician', desc: 'Need an experienced electrician for wiring.', salary: '₹20000/mo' },
      { title: 'Plumber for apartment complex', trade: 'plumber', desc: 'Full time plumber for maintenance.', salary: '₹18000/mo' },
      { title: 'Carpenter for modular kitchen', trade: 'carpenter', desc: 'Wood work for a 3BHK flat.', salary: '₹15000/mo' },
      { title: 'Electrician (Helper)', trade: 'electrician', desc: 'Helper for electrical work.', salary: '₹10000/mo' },
      { title: 'Delivery Partner', trade: 'delivery', desc: 'Need delivery boys for e-commerce.', salary: '₹15000/mo' }
    ];

    const jobs = [];
    for (const j of jobsData) {
      const job = await Job.create({
        employerId: employer._id,
        title: j.title,
        description: j.desc,
        tradeCategory: j.trade,
        location: { type: 'Point', coordinates: [77.371, 28.621] },
        address: 'Sector 62, Noida',
        salaryRange: j.salary,
        jobType: 'full-time',
        status: 'open'
      });
      jobs.push(job);
    }
    console.log(`Created ${jobs.length} jobs.`);

    // Create some applications
    // Electrician applies to Senior Electrician
    await Application.create({
      jobId: jobs[0]._id,
      workerId: workers[0]._id,
      status: 'applied'
    });
    // Plumber applies to Plumber job
    await Application.create({
      jobId: jobs[1]._id,
      workerId: workers[1]._id,
      status: 'shortlisted'
    });
    // Carpenter applies to Carpenter job
    await Application.create({
      jobId: jobs[2]._id,
      workerId: workers[2]._id,
      status: 'hired'
    });

    console.log('Created applications.');
    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
