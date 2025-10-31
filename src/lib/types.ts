export type UserDoc = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  lastSeen?: number; // ms epoch
};

import type { Timestamp } from "firebase/firestore";

export type Conversation = {
  id: string;
  members: string[]; // 2 uids
  createdAt?: Timestamp;
};

export type Message = {
  id: string;
  text: string;
  senderId: string;
  receiverId?: string;
  createdAt?: Timestamp;
};
