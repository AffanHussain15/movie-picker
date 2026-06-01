import { Group, GroupModel } from './models';
import { isMongoDbEnabled } from './connect';
import { getJsonGroup, saveJsonGroup, listJsonGroups } from './jsonDb';

export async function getGroupById(id: string): Promise<Group | null> {
  const isMongo = await isMongoDbEnabled();
  if (isMongo) {
    try {
      const groupDoc = await GroupModel.findOne({ id }).lean();
      if (!groupDoc) return null;
      // Convert document to clean Group object
      return {
        id: groupDoc.id,
        name: groupDoc.name,
        memberCount: groupDoc.memberCount,
        members: groupDoc.members.map((m: any) => ({
          id: m.id,
          name: m.name,
          preferences: m.preferences ? {
            genres: m.preferences.genres || [],
            mood: m.preferences.mood || '',
            runtime: m.preferences.runtime || 'any',
            language: m.preferences.language || 'any',
            yearRange: m.preferences.yearRange || [1980, 2026],
          } : undefined,
          swipes: m.swipes ? Object.fromEntries(m.swipes) : {},
        })),
        watchlist: groupDoc.watchlist || [],
        createdAt: groupDoc.createdAt,
        updatedAt: groupDoc.updatedAt,
      };
    } catch (error) {
      console.error('MongoDB getGroupById error, failing over to JSON', error);
      return getJsonGroup(id);
    }
  } else {
    return getJsonGroup(id);
  }
}

export async function saveGroupSession(group: Group): Promise<void> {
  const isMongo = await isMongoDbEnabled();
  if (isMongo) {
    try {
      await GroupModel.findOneAndUpdate(
        { id: group.id },
        {
          id: group.id,
          name: group.name,
          memberCount: group.memberCount,
          members: group.members.map((m) => ({
            id: m.id,
            name: m.name,
            preferences: m.preferences,
            swipes: m.swipes || {},
          })),
          watchlist: group.watchlist,
          createdAt: group.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('MongoDB saveGroupSession error, failing over to JSON', error);
      await saveJsonGroup(group);
    }
  } else {
    await saveJsonGroup(group);
  }
}

export async function getAllGroups(): Promise<Group[]> {
  const isMongo = await isMongoDbEnabled();
  if (isMongo) {
    try {
      const docs = await GroupModel.find().lean();
      return docs.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        memberCount: doc.memberCount,
        members: doc.members || [],
        watchlist: doc.watchlist || [],
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
    } catch (error) {
      console.error('MongoDB getAllGroups error, failing over to JSON', error);
      return listJsonGroups();
    }
  } else {
    return listJsonGroups();
  }
}
