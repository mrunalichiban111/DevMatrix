import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    process.env.MONGO_URL ||
    process.env.mongodb_uri ||
    process.env.mongodb_url ||
    process.env.mongo_url
  );
}

export function getMongoClient() {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error('Missing MongoDB connection string. Set MONGODB_URI (or MONGODB_URL/MONGO_URL).');
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

export function getMongoDbName() {
  return process.env.MONGODB_DB_NAME || 'devmatrix';
}
