export interface Preference {
  genres: string[];
  mood: string;
  runtime: string; // 'under-90' | '90-120' | '120+' | 'any'
  language: string;
  yearRange: [number, number];
}

export interface Member {
  id: string;
  name: string;
  preferences?: Preference;
  swipes: Record<string, 'like' | 'skip'>; // movieId -> 'like' | 'skip'
}

export interface Group {
  id: string;
  name: string;
  memberCount: number;
  members: Member[];
  watchlist: string[]; // movie IDs
  createdAt: string;
  updatedAt: string;
}

// We will also use these types in the JSON Database fallback.
// For MongoDB, we define schemas. Mongoose will compile them dynamically if MongoDB is used.
import mongoose, { Schema, Document } from 'mongoose';

const PreferenceSchema = new Schema<Preference>({
  genres: { type: [String], default: [] },
  mood: { type: String, default: '' },
  runtime: { type: String, default: 'any' },
  language: { type: String, default: 'any' },
  yearRange: { type: [Number], default: [1980, 2026] },
}, { _id: false });

const MemberSchema = new Schema<Member>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  preferences: { type: PreferenceSchema, required: false },
  swipes: { type: Map, of: String, default: {} },
}, { _id: false });

const GroupSchema = new Schema<Group & Document>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  memberCount: { type: Number, required: true },
  members: { type: [MemberSchema], default: [] },
  watchlist: { type: [String], default: [] },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

export const GroupModel = mongoose.models.Group || mongoose.model<Group & Document>('Group', GroupSchema);
