import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Extend the global interface to include _mongoClientPromise
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  throw new Error("Missing MongoDB URI in .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve the client across hot reloading
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
