import mongoose from 'mongoose';
import Repository from '../src/models/Repository.model.js';
import PullRequest from '../src/models/PullRequest.model.js';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);

const repos = await Repository.find({}, '_id');
for (const repo of repos) {
  const max = await PullRequest.findOne({ repository: repo._id })
    .sort({ number: -1 })
    .select('number');
  await Repository.updateOne(
    { _id: repo._id },
    { $set: { prCount: max?.number || 0 } }
  );
  console.log(`Repo ${repo._id}: prCount set to ${max?.number || 0}`);
}

console.log('Migration complete');
await mongoose.disconnect();