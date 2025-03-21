"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

export function Room({ children, params }) {
  // Ensure we have a valid room ID
  const roomId = params?.documentid || 'default-room';
  
  return (
    <LiveblocksProvider 
      authEndpoint={`/api/liveblocks-auth?roomId=${roomId}`}
      resolveUsers={async ({ userIds }) => {
        const q = query(collection(db, 'LoopUsers'), where('email', 'in', userIds));
        const querySnapshot = await getDocs(q);
        const userList = [];
        querySnapshot.forEach((doc) => {
          userList.push(doc.data());
        });
        return userList;
      }}
      
      resolveMentionSuggestions={async ({ text, roomId }) => {
        const q = query(collection(db, 'LoopUsers'), where('email', '!=', null));
        const querySnapshot = await getDocs(q);
        let userList = [];
        querySnapshot.forEach((doc) => {
          userList.push(doc.data());
        });

        if (text) {
          userList = userList.filter((user) => user.name.includes(text));
        }

        return userList.map((user) => user.email);
      }}
    >
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}