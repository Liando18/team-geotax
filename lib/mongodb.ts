import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI');
}

const uri = process.env.MONGODB_URI;
const options = { appName: "dev-geotax" };

let client: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  client = (global as any)._mongoClientPromise;
} else {
  const clientPromise = new MongoClient(uri, options);
  client = clientPromise.connect();
}

export default client