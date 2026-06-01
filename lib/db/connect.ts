import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = globalThis.mongooseCache || { conn: null, promise: null };

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<boolean> {
  if (!MONGODB_URI) {
    // No MongoDB URI configured, fallback to JSON Database
    return false;
  }

  if (cached.conn) {
    return true;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB', e);
    return false;
  }

  return true;
}

/**
 * Helper to determine whether we are using MongoDB or JSON DB.
 * Returns true if MongoDB is configured and connected, false otherwise.
 */
export async function isMongoDbEnabled(): Promise<boolean> {
  if (!MONGODB_URI) return false;
  try {
    const connected = await connectToDatabase();
    return connected;
  } catch {
    return false;
  }
}
