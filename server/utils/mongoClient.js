import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
let clientPromise;

if (!global._mongoClientPromise) {
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
