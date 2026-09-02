import { create } from "zustand";

export type ChatMessageUser = {
  id: string;
  name: string;
  avatar: string | null;
  status: string;
};

export type ChatMessage = {
  id: string;
  groupId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;

  user?: ChatMessageUser;
};

export type DirectChatUser = {
  id: string;
  name: string;
  avatar: string | null;
  status: string;
};

export type DirectChatMessage = {
  id: string;

  senderId: string;

  receiverId: string;

  text: string;

  createdAt: string;

  updatedAt?: string;

  sender?: DirectChatUser;

  receiver?: DirectChatUser;
};

type ChatStore = {
  /*
   * Conversas de grupo.
   *
   * groupId -> mensagens
   */
  messages: Record<
    string,
    ChatMessage[]
  >;

  /*
   * Conversas privadas.
   *
   * conversationId:
   * direct-userA-userB
   *
   * -> mensagens
   */
  directMessages: Record<
    string,
    DirectChatMessage[]
  >;

  setMessages: (
    groupId: string,
    messages: ChatMessage[],
  ) => void;

  addMessage: (
    groupId: string,
    message: ChatMessage,
  ) => void;

  clearMessages: (
    groupId: string,
  ) => void;

  clearAllMessages: () => void;

  setDirectMessages: (
    conversationId: string,
    messages: DirectChatMessage[],
  ) => void;

  addDirectMessage: (
    conversationId: string,
    message: DirectChatMessage,
  ) => void;

  clearDirectMessages: (
    conversationId: string,
  ) => void;

  clearAllDirectMessages: () => void;

  clearAllChats: () => void;
};

function getTimestamp(
  value?: string,
): number {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function sortMessages(
  messages: ChatMessage[],
): ChatMessage[] {
  return [...messages].sort(
    (a, b) =>
      getTimestamp(a.createdAt) -
      getTimestamp(b.createdAt),
  );
}

function sortDirectMessages(
  messages: DirectChatMessage[],
): DirectChatMessage[] {
  return [...messages].sort(
    (a, b) =>
      getTimestamp(a.createdAt) -
      getTimestamp(b.createdAt),
  );
}

function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const unique =
    new Map<string, ChatMessage>();

  for (const message of existing) {
    unique.set(
      message.id,
      message,
    );
  }

  for (const message of incoming) {
    const previous =
      unique.get(message.id);

    if (previous) {
      unique.set(
        message.id,
        {
          ...previous,
          ...message,

          user:
            message.user ??
            previous.user,
        },
      );
    } else {
      unique.set(
        message.id,
        message,
      );
    }
  }

  return sortMessages(
    Array.from(
      unique.values(),
    ),
  );
}

function mergeDirectMessages(
  existing: DirectChatMessage[],
  incoming: DirectChatMessage[],
): DirectChatMessage[] {
  const unique =
    new Map<
      string,
      DirectChatMessage
    >();

  for (const message of existing) {
    unique.set(
      message.id,
      message,
    );
  }

  for (const message of incoming) {
    const previous =
      unique.get(message.id);

    if (previous) {
      unique.set(
        message.id,
        {
          ...previous,
          ...message,

          sender:
            message.sender ??
            previous.sender,

          receiver:
            message.receiver ??
            previous.receiver,
        },
      );
    } else {
      unique.set(
        message.id,
        message,
      );
    }
  }

  return sortDirectMessages(
    Array.from(
      unique.values(),
    ),
  );
}

export const useChatStore =
  create<ChatStore>(
    (set) => ({
      messages: {},

      directMessages: {},

      /*
       * ================================
       * GRUPO
       * ================================
       */

      setMessages: (
        groupId,
        newMessages,
      ) => {
        if (!groupId) {
          return;
        }

        set((state) => {
          const existing =
            state.messages[
              groupId
            ] ?? [];

          const merged =
            mergeMessages(
              existing,
              newMessages,
            );

          return {
            messages: {
              ...state.messages,

              [groupId]:
                merged,
            },
          };
        });
      },

      addMessage: (
        groupId,
        message,
      ) => {
        if (
          !groupId ||
          !message?.id
        ) {
          return;
        }

        set((state) => {
          const existing =
            state.messages[
              groupId
            ] ?? [];

          const merged =
            mergeMessages(
              existing,
              [message],
            );

          if (
            merged.length ===
              existing.length &&
            merged.every(
              (
                item,
                index,
              ) =>
                item.id ===
                  existing[
                    index
                  ]?.id &&
                item.text ===
                  existing[
                    index
                  ]?.text &&
                item.createdAt ===
                  existing[
                    index
                  ]?.createdAt,
            )
          ) {
            return state;
          }

          return {
            messages: {
              ...state.messages,

              [groupId]:
                merged,
            },
          };
        });
      },

      clearMessages: (
        groupId,
      ) => {
        if (!groupId) {
          return;
        }

        set((state) => {
          const next = {
            ...state.messages,
          };

          delete next[groupId];

          return {
            messages: next,
          };
        });
      },

      clearAllMessages: () => {
        set({
          messages: {},
        });
      },

      /*
       * ================================
       * CONVERSAS PRIVADAS
       * ================================
       */

      setDirectMessages: (
        conversationId,
        newMessages,
      ) => {
        if (!conversationId) {
          return;
        }

        set((state) => {
          const existing =
            state.directMessages[
              conversationId
            ] ?? [];

          const merged =
            mergeDirectMessages(
              existing,
              newMessages,
            );

          return {
            directMessages: {
              ...state.directMessages,

              [conversationId]:
                merged,
            },
          };
        });
      },

      addDirectMessage: (
        conversationId,
        message,
      ) => {
        if (
          !conversationId ||
          !message?.id
        ) {
          return;
        }

        set((state) => {
          const existing =
            state.directMessages[
              conversationId
            ] ?? [];

          const merged =
            mergeDirectMessages(
              existing,
              [message],
            );

          /*
           * Evita renderizações
           * desnecessárias quando a mesma
           * mensagem chega pelo:
           *
           * 1. direct:message:new
           * 2. direct:message:sent
           *
           * O ID do banco é usado como
           * identificador definitivo.
           */
          if (
            merged.length ===
              existing.length &&
            merged.every(
              (
                item,
                index,
              ) => {
                const previous =
                  existing[
                    index
                  ];

                return (
                  item.id ===
                    previous?.id &&
                  item.text ===
                    previous?.text &&
                  item.createdAt ===
                    previous?.createdAt &&
                  item.senderId ===
                    previous?.senderId &&
                  item.receiverId ===
                    previous?.receiverId
                );
              },
            )
          ) {
            return state;
          }

          return {
            directMessages: {
              ...state.directMessages,

              [conversationId]:
                merged,
            },
          };
        });
      },

      clearDirectMessages: (
        conversationId,
      ) => {
        if (!conversationId) {
          return;
        }

        set((state) => {
          const next = {
            ...state.directMessages,
          };

          delete next[
            conversationId
          ];

          return {
            directMessages:
              next,
          };
        });
      },

      clearAllDirectMessages:
        () => {
          set({
            directMessages: {},
          });
        },

      /*
       * Limpa grupos e conversas
       * privadas.
       */
      clearAllChats: () => {
        set({
          messages: {},

          directMessages: {},
        });
      },
    }),
  );