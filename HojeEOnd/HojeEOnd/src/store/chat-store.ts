import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import {
  messages as initialMessages,
  type Message,
} from "@/data/messages";

interface ChatStore {
  messages: Message[];

  sendMessage: (
    message: Message,
  ) => void;

  getGroupMessages: (
    groupId: string,
  ) => Message[];
}

export const useChatStore =
  create<ChatStore>()(
    persist(
      (set, get) => ({
        messages:
          initialMessages,

        sendMessage: (
          message,
        ) =>
          set((state) => ({
            messages: [
              ...state.messages,
              message,
            ],
          })),

        getGroupMessages: (
          groupId,
        ) =>
          get().messages.filter(
            (message) =>
              message.groupId ===
              groupId,
          ),
      }),

      {
        name:
          "hojeond-chat-v2",

        storage:
          createJSONStorage(
            () =>
              AsyncStorage,
          ),

        partialize: (
          state,
        ) => ({
          messages:
            state.messages,
        }),
      },
    ),
  );