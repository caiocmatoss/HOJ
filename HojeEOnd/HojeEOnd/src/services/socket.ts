import { io, type Socket } from "socket.io-client";

import { BACKEND_URL } from "@/config/backend";

import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";

/* =========================================================
 * CONFIGURAÇÃƒO
 * ======================================================= */

export const SOCKET_URL = BACKEND_URL;

/* =========================================================
 * TIPOS
 * ======================================================= */

export type ServerMessage = {
  id: string;
  groupId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;

  user?: {
    id: string;
    name: string;
    avatar: string | null;
    status: string;
  };
};

export type DirectServerMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;

  sender?: {
    id: string;
    name: string;
    avatar: string | null;
    status: string;
  };

  receiver?: {
    id: string;
    name: string;
    avatar: string | null;
    status: string;
  };
};

export type ChatErrorData = {
  code?: string;
  message: string;
};

export type SocketNotification = { id: string; userId: string; type: string; title: string; message: string; referenceId: string | null; referenceType: string | null; readAt: string | null; createdAt: string; };

export type PresenceStatus =
  | "ONLINE"
  | "OFFLINE";

export type PresenceChangedData = {
  userId: string;
  status: PresenceStatus;
};

export type PresenceUser = {
  id: string;
  status: PresenceStatus;
};
export type LocationUpdatedData = {
  userId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  distanceMeters?: number;
  distanceKm?: number;
};

export type LocationJoinedData = {
  userId: string;
};

export type LocationSavedData =
  LocationUpdatedData & {
    nearbyFriends?: number;
  };

/* =========================================================
 * EVENTOS SERVIDOR -> CLIENTE
 * ======================================================= */

type ServerToClientEvents = {
  "notification:new": (notification: SocketNotification) => void;
  /* -------------------------
   * CHAT DE GRUPO
   * ----------------------- */

  "message:new": (
    message: ServerMessage,
  ) => void;

  "chat:joined": (
    data: {
      groupId: string;
    },
  ) => void;

  "chat:left": (
    data: {
      groupId: string;
    },
  ) => void;

  "chat:error": (
    data: ChatErrorData,
  ) => void;

  "message:sent": (
    data: ServerMessage,
  ) => void;

  /* -------------------------
   * CHAT PRIVADO
   * ----------------------- */

  "direct:chat:joined": (
    data: {
      userId: string;
    },
  ) => void;

  "direct:chat:left": (
    data: {
      userId: string;
    },
  ) => void;

  "direct:chat:error": (
    data: ChatErrorData,
  ) => void;

  "direct:message:new": (
    message: DirectServerMessage,
  ) => void;

  "direct:message:sent": (
    message: DirectServerMessage,
  ) => void;

  /* -------------------------
   * PRESENÇA
   * ----------------------- */

  "presence:list": (
    data: PresenceUser[],
  ) => void;

  "presence:error": (
    data: ChatErrorData,
  ) => void;

  "presence:changed": (
    data: PresenceChangedData,
  ) => void;
  "location:joined": (
    data: LocationJoinedData,
  ) => void;

  "location:left": (
    data: LocationJoinedData,
  ) => void;

  "location:saved": (
    data: LocationSavedData,
  ) => void;

  "location:updated": (
    data: LocationUpdatedData,
  ) => void;
};

/* =========================================================
 * EVENTOS CLIENTE -> SERVIDOR
 * ======================================================= */

type ClientToServerEvents = {
  "notifications:join": () => void;
  "notifications:leave": () => void;
  /* -------------------------
   * CHAT DE GRUPO
   * ----------------------- */

  "chat:join": (
    data: {
      groupId: string;
    },
  ) => void;

  "chat:leave": (
    data: {
      groupId: string;
    },
  ) => void;

  "message:send": (
    data: {
      groupId: string;
      text: string;
    },
  ) => void;

  /* -------------------------
   * CHAT PRIVADO
   * ----------------------- */

  "direct:join": (
    data: {
      userId: string;
    },
  ) => void;

  "direct:leave": (
    data: {
      userId: string;
    },
  ) => void;

  "direct:message:send": (
    data: {
      receiverId: string;
      text: string;
    },
  ) => void;

  /* -------------------------
   * PRESENÇA
   * ----------------------- */

  "presence:get": () => void;

  "location:join": (
    callback?: (response: unknown) => void,
  ) => void;

  "location:leave": (
    callback?: (response: unknown) => void,
  ) => void;

  "location:update": (
    data: {
      latitude: number;
      longitude: number;
    },
    callback?: (response: unknown) => void,
  ) => void;
};

type AppSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

/* =========================================================
 * ESTADO
 * ======================================================= */

let socket: AppSocket | null = null;

const joinedGroups =
  new Set<string>();

let joinedNotifications = false;
let notificationsRoomRequested = false;
let notificationsJoinPromise: Promise<void> | null = null;
let notificationsJoinGeneration = 0;

const joinedDirectUsers =
  new Set<string>();

const joinPromises =
  new Map<
    string,
    Promise<void>
  >();

const directJoinPromises =
  new Map<
    string,
    Promise<void>
  >();
let joinedLocationRoom: boolean = false;

let locationJoinPromise:
  Promise<void> | null = null;

/* =========================================================
 * LIMPAR ESTADO DE CONEXÃƒO
 * ======================================================= */

function clearSocketState(): void {
  joinedGroups.clear();
  joinedDirectUsers.clear();
  joinPromises.clear();
  directJoinPromises.clear();
  joinedNotifications = false;
  notificationsJoinPromise = null;
}

/* =========================================================
 * SOCKET
 * ======================================================= */

export function getSocket():
  | AppSocket
  | null {
  return socket;
}

/* =========================================================
 * CONECTAR
 * ======================================================= */

export function connectSocket(): AppSocket {
  const accessToken =
    useUserStore.getState()
      .accessToken;

  if (!accessToken) {
    throw new Error(
      "Não foi possível conectar ao chat: usuário não autenticado.",
    );
  }

  if (
    socket &&
    socket.connected
  ) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  clearSocketState();

  socket = io(
    SOCKET_URL,
    {
      transports: [
        "websocket",
      ],

      auth: {
        token: accessToken,
      },

      autoConnect: true,

      reconnection: true,

      reconnectionAttempts: 5,

      reconnectionDelay: 1000,
    },
  );

  /* =======================================================
   * CONEXÃƒO
   * ===================================================== */

  socket.on(
    "connect",
    () => {
      console.log(
        "[Socket.IO] conectado:",
        socket?.id,
      );

      /*
       * Depois de conectar/reconectar,
       * buscamos novamente a presença atual.
       *
       * O backend mantém a lista baseada
       * nas conexÃµes atualmente ativas.
       */
      void refreshPresence();

      if (
        notificationsRoomRequested &&
        !joinedNotifications
      ) {
        void joinNotifications().catch((error: unknown) => {
          console.error(
            "[Socket.IO] erro ao reentrar na sala de notificações:",
            error,
          );
        });
      }

      const groupsToRejoin = Array.from(
        joinedGroups,
      );
      const directUsersToRejoin = Array.from(
        joinedDirectUsers,
      );

      joinedGroups.clear();
      joinedDirectUsers.clear();
      joinPromises.clear();
      directJoinPromises.clear();

      for (const groupId of groupsToRejoin) {
        void joinGroup(groupId).catch((error: unknown) => {
          console.error(
            "[Socket.IO] erro ao reentrar no grupo:",
            groupId,
            error,
          );
        });
      }

      for (const userId of directUsersToRejoin) {
        void joinDirectConversation(userId).catch((error: unknown) => {
          console.error(
            "[Socket.IO] erro ao reentrar na conversa direta:",
            userId,
            error,
          );
        });
      }
    },
  );

  socket.on(
    "connect_error",
    (error) => {
      console.error(
        "[Socket.IO] connect_error:",
        error.message,
      );
    },
  );

  socket.on(
    "disconnect",
    (reason) => {
      console.log(
        "[Socket.IO] desconectado:",
        reason,
      );

      joinPromises.clear();
      directJoinPromises.clear();
      joinedNotifications = false;
      notificationsJoinPromise = null;

      joinedLocationRoom = false;
      locationJoinPromise = null;

      /*
       * A presença deixa de ser considerada
       * válida localmente quando o socket
       * do próprio cliente cai.
       *
       * Não alteramos usuários individuais
       * para OFFLINE aqui porque o estado
       * correto deve vir do servidor.
       *
       * Na próxima conexão, presence:list
       * reconstrói o estado atual.
       */
      usePresenceStore
        .getState()
        .clearPresence();

    },
  );

  /* =======================================================
   * EVENTOS DE GRUPO
   * ===================================================== */

  socket.on(
    "chat:joined",
    (data) => {
      console.log(
        "[Socket.IO] chat:joined:",
        data,
      );

      if (data?.groupId) {
        joinedGroups.add(
          data.groupId,
        );
      }
    },
  );

  socket.on(
    "chat:left",
    (data) => {
      console.log(
        "[Socket.IO] chat:left:",
        data,
      );

      if (data?.groupId) {
        joinedGroups.delete(
          data.groupId,
        );
      }
    },
  );

  socket.on(
    "chat:error",
    (data) => {
      console.error(
        "[Socket.IO] chat:error:",
        data,
      );
    },
  );

  socket.on(
    "message:sent",
    (data) => {
      console.log(
        "[Socket.IO] message:sent:",
        data,
      );
    },
  );

  socket.on(
    "message:new",
    (data) => {
      console.log(
        "[Socket.IO] message:new:",
        data,
      );
    },
  );

  /* =======================================================
   * EVENTOS DE CHAT PRIVADO
   * ===================================================== */

  socket.on(
    "direct:chat:joined",
    (data) => {
      console.log(
        "[Socket.IO] direct:chat:joined:",
        data,
      );

      if (data?.userId) {
        joinedDirectUsers.add(
          data.userId,
        );
      }
    },
  );

  socket.on(
    "direct:chat:left",
    (data) => {
      console.log(
        "[Socket.IO] direct:chat:left:",
        data,
      );

      if (data?.userId) {
        joinedDirectUsers.delete(
          data.userId,
        );
      }
    },
  );

  socket.on(
    "direct:chat:error",
    (data) => {
      console.error(
        "[Socket.IO] direct:chat:error:",
        data,
      );
    },
  );

  socket.on(
    "direct:message:sent",
    (data) => {
      console.log(
        "[Socket.IO] direct:message:sent:",
        data,
      );
    },
  );

  socket.on(
    "direct:message:new",
    (data) => {
      console.log(
        "[Socket.IO] direct:message:new:",
        data,
      );
    },
  );

  /* =======================================================
   * PRESENÇA
   * ===================================================== */

  socket.on(
    "presence:list",
    (data) => {
      console.log(
        "[Socket.IO] presence:list:",
        data,
      );

      if (
        !Array.isArray(data)
      ) {
        return;
      }

      usePresenceStore
        .getState()
        .setPresenceList(
          data,
        );
    },
  );

  socket.on(
    "presence:error",
    (data) => {
      console.error(
        "[Socket.IO] presence:error:",
        data,
      );
    },
  );

  socket.on(
    "presence:changed",
    (data) => {
      console.log(
        "[Socket.IO] presence:changed:",
        data,
      );

      if (
        !data ||
        typeof data.userId !==
          "string"
      ) {
        return;
      }

      if (
        data.status !==
          "ONLINE" &&
        data.status !==
          "OFFLINE"
      ) {
        return;
      }

      usePresenceStore
        .getState()
        .updatePresence(
          data,
        );
    },
  );

  /*
   * =======================================================
   * LOCALIZAÇÃO EM TEMPO REAL
   * =======================================================
   *
   * O backend envia a posição dos amigos através de:
   *
   * location:updated
   *
   * Mantemos a posição no PresenceStore para que
   * FriendsMap/NearbyFriends sejam atualizados
   * automaticamente pelo Zustand.
   */
  socket.on(
    "location:updated",
    (data) => {
      console.log(
        "[Socket.IO] location:updated:",
        data,
      );

      if (
        !data ||
        typeof data.userId !== "string" ||
        !data.userId.trim() ||
        !Number.isFinite(data.latitude) ||
        !Number.isFinite(data.longitude) ||
        typeof data.updatedAt !== "string"
      ) {
        return;
      }

      usePresenceStore
        .getState()
        .updateFriendLocation(data);
    },
  );

  return socket;
}

/* =========================================================
 * ATUALIZAR PRESENÇA
 * ======================================================= */

async function refreshPresence():
  Promise<void> {
  /*
   * Evita chamadas antes do socket
   * estar efetivamente conectado.
   */
  if (
    !socket ||
    !socket.connected
  ) {
    return;
  }

  try {
    await getPresence();

    console.log(
      "[Socket.IO] presença atualizada após conexão.",
    );
  } catch (error) {
    console.error(
      "[Socket.IO] erro ao atualizar presença:",
      error,
    );
  }
}

/* =========================================================
 * AGUARDAR CONEXÃƒO
 * ======================================================= */

function waitForConnection(
  currentSocket: AppSocket,
): Promise<void> {
  if (
    currentSocket.connected
  ) {
    return Promise.resolve();
  }

  return new Promise<void>(
    (
      resolve,
      reject,
    ) => {
      let finished = false;

      const timeout =
        setTimeout(
          () => {
            if (finished) {
              return;
            }

            finished = true;

            cleanup();

            reject(
              new Error(
                "Tempo esgotado ao conectar ao servidor de chat.",
              ),
            );
          },
          10000,
        );

      const handleConnect =
        () => {
          if (finished) {
            return;
          }

          finished = true;

          cleanup();

          resolve();
        };

      const handleError =
        (error: Error) => {
          if (finished) {
            return;
          }

          finished = true;

          cleanup();

          reject(error);
        };

      const cleanup =
        () => {
          clearTimeout(
            timeout,
          );

          currentSocket.off(
            "connect",
            handleConnect,
          );

          currentSocket.off(
            "connect_error",
            handleError,
          );
        };

      currentSocket.once(
        "connect",
        handleConnect,
      );

      currentSocket.once(
        "connect_error",
        handleError,
      );
    },
  );
}

/* =========================================================
 * DESCONECTAR
 * ======================================================= */

export function disconnectSocket(): void {
  if (!socket) {
    return;
  }

  notificationsRoomRequested = false;
  notificationsJoinGeneration += 1;
  clearSocketState();

  joinedLocationRoom = false;
  locationJoinPromise = null;

  usePresenceStore
    .getState()
    .clearPresence();

  socket.disconnect();

  socket = null;
}

/* =========================================================
 * CHAT DE GRUPO
 * ======================================================= */

export async function joinGroup(
  groupId: string,
): Promise<void> {
  const normalizedGroupId =
    groupId.trim();

  if (!normalizedGroupId) {
    return;
  }

  if (
    joinedGroups.has(
      normalizedGroupId,
    )
  ) {
    return;
  }

  const existingPromise =
    joinPromises.get(
      normalizedGroupId,
    );

  if (existingPromise) {
    return existingPromise;
  }

  const promise =
    new Promise<void>(
      async (
        resolve,
        reject,
      ) => {
        let currentSocket:
          | AppSocket
          | null = null;

        let finished =
          false;

        let timeout:
          | ReturnType<
              typeof setTimeout
            >
          | null = null;

        const cleanup =
          () => {
            if (timeout) {
              clearTimeout(
                timeout,
              );

              timeout = null;
            }

            if (
              !currentSocket
            ) {
              return;
            }

            currentSocket.off(
              "chat:joined",
              handleJoined,
            );

            currentSocket.off(
              "chat:error",
              handleError,
            );
          };

        const handleJoined =
          (data: {
            groupId: string;
          }) => {
            if (
              data?.groupId !==
              normalizedGroupId
            ) {
              return;
            }

            if (finished) {
              return;
            }

            finished = true;

            joinedGroups.add(
              normalizedGroupId,
            );

            cleanup();

            resolve();
          };

        const handleError =
          (
            data: ChatErrorData,
          ) => {
            if (finished) {
              return;
            }

            finished = true;

            cleanup();

            reject(
              new Error(
                data?.message ??
                  "Não foi possível entrar no grupo.",
              ),
            );
          };

        try {
          currentSocket =
            connectSocket();

          await waitForConnection(
            currentSocket,
          );

          if (
            joinedGroups.has(
              normalizedGroupId,
            )
          ) {
            finished = true;

            cleanup();

            resolve();

            return;
          }

          timeout =
            setTimeout(
              () => {
                if (
                  finished
                ) {
                  return;
                }

                finished =
                  true;

                cleanup();

                reject(
                  new Error(
                    "Tempo esgotado ao entrar no grupo.",
                  ),
                );
              },
              10000,
            );

          currentSocket.once(
            "chat:joined",
            handleJoined,
          );

          currentSocket.once(
            "chat:error",
            handleError,
          );

          currentSocket.emit(
            "chat:join",
            {
              groupId:
                normalizedGroupId,
            },
          );
        } catch (error) {
          finished = true;

          cleanup();

          reject(error);
        }
      },
    );

  joinPromises.set(
    normalizedGroupId,
    promise,
  );

  try {
    await promise;
  } finally {
    joinPromises.delete(
      normalizedGroupId,
    );
  }
}

export function leaveGroup(
  groupId: string,
): void {
  const normalizedGroupId =
    groupId.trim();

  if (
    !normalizedGroupId ||
    !socket ||
    !socket.connected
  ) {
    return;
  }

  socket.emit(
    "chat:leave",
    {
      groupId:
        normalizedGroupId,
    },
  );

  joinedGroups.delete(
    normalizedGroupId,
  );
}

export async function sendSocketMessage(
  groupId: string,
  text: string,
): Promise<ServerMessage> {
  const normalizedGroupId =
    groupId.trim();

  const trimmedText =
    text.trim();

  if (!normalizedGroupId) {
    throw new Error(
      "groupId é obrigatório.",
    );
  }

  if (!trimmedText) {
    throw new Error(
      "A mensagem não pode estar vazia.",
    );
  }

  if (
    trimmedText.length >
    2000
  ) {
    throw new Error(
      "A mensagem não pode ter mais de 2000 caracteres.",
    );
  }

  const currentSocket =
    connectSocket();

  await waitForConnection(
    currentSocket,
  );

  if (
    !joinedGroups.has(
      normalizedGroupId,
    )
  ) {
    await joinGroup(
      normalizedGroupId,
    );
  }

  if (
    !joinedGroups.has(
      normalizedGroupId,
    )
  ) {
    throw new Error(
      "O usuário não está autorizado neste grupo.",
    );
  }

  return new Promise<ServerMessage>(
    (
      resolve,
      reject,
    ) => {
      let finished =
        false;

      let timeout:
        | ReturnType<
            typeof setTimeout
          >
        | null = null;

      const cleanup =
        () => {
          if (timeout) {
            clearTimeout(
              timeout,
            );

            timeout = null;
          }

          currentSocket.off(
            "message:sent",
            handleSent,
          );

          currentSocket.off(
            "chat:error",
            handleError,
          );
        };

      const handleSent =
        (
          message: ServerMessage,
        ) => {
          if (
            message.groupId !==
            normalizedGroupId
          ) {
            return;
          }

          if (finished) {
            return;
          }

          finished = true;

          cleanup();

          resolve(message);
        };

      const handleError =
        (
          data: ChatErrorData,
        ) => {
          if (finished) {
            return;
          }

          finished = true;

          cleanup();

          reject(
            new Error(
              data?.message ??
                "Não foi possível enviar a mensagem.",
            ),
          );
        };

      timeout =
        setTimeout(
          () => {
            if (finished) {
              return;
            }

            finished = true;

            cleanup();

            reject(
              new Error(
                "Tempo esgotado aguardando resposta do servidor.",
              ),
            );
          },
          10000,
        );

      currentSocket.once(
        "message:sent",
        handleSent,
      );

      currentSocket.once(
        "chat:error",
        handleError,
      );

      currentSocket.emit(
        "message:send",
        {
          groupId:
            normalizedGroupId,
          text: trimmedText,
        },
      );
    },
  );
}

/* =========================================================
 * CHAT PRIVADO
 * ======================================================= */

export async function joinDirectConversation(
  userId: string,
): Promise<void> {
  const normalizedUserId =
    userId.trim();

  if (!normalizedUserId) {
    return;
  }

  if (
    joinedDirectUsers.has(
      normalizedUserId,
    )
  ) {
    return;
  }

  const existingPromise =
    directJoinPromises.get(
      normalizedUserId,
    );

  if (existingPromise) {
    return existingPromise;
  }

  const promise =
    new Promise<void>(
      async (
        resolve,
        reject,
      ) => {
        let currentSocket:
          | AppSocket
          | null = null;

        let finished =
          false;

        let timeout:
          | ReturnType<
              typeof setTimeout
            >
          | null = null;

        const cleanup =
          () => {
            if (timeout) {
              clearTimeout(
                timeout,
              );

              timeout = null;
            }

            if (
              !currentSocket
            ) {
              return;
            }

            currentSocket.off(
              "direct:chat:joined",
              handleJoined,
            );

            currentSocket.off(
              "direct:chat:error",
              handleError,
            );
          };

        const handleJoined =
          (data: {
            userId: string;
          }) => {
            if (
              data?.userId !==
              normalizedUserId
            ) {
              return;
            }

            if (finished) {
              return;
            }

            finished = true;

            joinedDirectUsers.add(
              normalizedUserId,
            );

            cleanup();

            resolve();
          };

        const handleError =
          (
            data: ChatErrorData,
          ) => {
            if (finished) {
              return;
            }

            finished = true;

            cleanup();

            reject(
              new Error(
                data?.message ??
                  "Não foi possível entrar na conversa privada.",
              ),
            );
          };

        try {
          currentSocket =
            connectSocket();

          await waitForConnection(
            currentSocket,
          );

          if (
            joinedDirectUsers.has(
              normalizedUserId,
            )
          ) {
            finished = true;

            cleanup();

            resolve();

            return;
          }

          timeout =
            setTimeout(
              () => {
                if (
                  finished
                ) {
                  return;
                }

                finished =
                  true;

                cleanup();

                reject(
                  new Error(
                    "Tempo esgotado ao entrar na conversa privada.",
                  ),
                );
              },
              10000,
            );

          currentSocket.once(
            "direct:chat:joined",
            handleJoined,
          );

          currentSocket.once(
            "direct:chat:error",
            handleError,
          );

          console.log(
            "[Socket.IO] entrando na conversa privada:",
            normalizedUserId,
          );

          currentSocket.emit(
            "direct:join",
            {
              userId:
                normalizedUserId,
            },
          );
        } catch (error) {
          finished = true;

          cleanup();

          reject(error);
        }
      },
    );

  directJoinPromises.set(
    normalizedUserId,
    promise,
  );

  try {
    await promise;
  } finally {
    directJoinPromises.delete(
      normalizedUserId,
    );
  }
}

export function leaveDirectConversation(
  userId: string,
): void {
  const normalizedUserId =
    userId.trim();

  if (
    !normalizedUserId ||
    !socket ||
    !socket.connected
  ) {
    return;
  }

  socket.emit(
    "direct:leave",
    {
      userId:
        normalizedUserId,
    },
  );

  joinedDirectUsers.delete(
    normalizedUserId,
  );
}

export async function sendDirectSocketMessage(
  receiverId: string,
  text: string,
): Promise<DirectServerMessage> {
  const normalizedReceiverId =
    receiverId.trim();

  const trimmedText =
    text.trim();

  if (!normalizedReceiverId) {
    throw new Error(
      "receiverId é obrigatório.",
    );
  }

  if (!trimmedText) {
    throw new Error(
      "A mensagem não pode estar vazia.",
    );
  }

  if (
    trimmedText.length >
    2000
  ) {
    throw new Error(
      "A mensagem não pode ter mais de 2000 caracteres.",
    );
  }

  const currentSocket =
    connectSocket();

  await waitForConnection(
    currentSocket,
  );

  if (
    !joinedDirectUsers.has(
      normalizedReceiverId,
    )
  ) {
    await joinDirectConversation(
      normalizedReceiverId,
    );
  }

  if (
    !joinedDirectUsers.has(
      normalizedReceiverId,
    )
  ) {
    throw new Error(
      "A conversa privada não está conectada.",
    );
  }

  return new Promise<DirectServerMessage>(
    (
      resolve,
      reject,
    ) => {
      let finished =
        false;

      let timeout:
        | ReturnType<
            typeof setTimeout
          >
        | null = null;

      const cleanup =
        () => {
          if (timeout) {
            clearTimeout(
              timeout,
            );

            timeout = null;
          }

          currentSocket.off(
            "direct:message:sent",
            handleSent,
          );

          currentSocket.off(
            "direct:chat:error",
            handleError,
          );
        };

      const handleSent =
        (
          message: DirectServerMessage,
        ) => {
          if (
            message.receiverId !==
            normalizedReceiverId
          ) {
            return;
          }

          if (finished) {
            return;
          }

          finished = true;

          cleanup();

          resolve(message);
        };

      const handleError =
        (
          data: ChatErrorData,
        ) => {
          if (finished) {
            return;
          }

          finished = true;

          cleanup();

          reject(
            new Error(
              data?.message ??
                "Não foi possível enviar a mensagem privada.",
            ),
          );
        };

      timeout =
        setTimeout(
          () => {
            if (finished) {
              return;
            }

            finished = true;

            cleanup();

            reject(
              new Error(
                "Tempo esgotado aguardando resposta do servidor.",
              ),
            );
          },
          10000,
        );

      currentSocket.once(
        "direct:message:sent",
        handleSent,
      );

      currentSocket.once(
        "direct:chat:error",
        handleError,
      );

      console.log(
        "[Socket.IO] enviando direct:message:send:",
        {
          receiverId:
            normalizedReceiverId,
          text: trimmedText,
        },
      );

      currentSocket.emit(
        "direct:message:send",
        {
          receiverId:
            normalizedReceiverId,
          text: trimmedText,
        },
      );
    },
  );
}

/* =========================================================
 * PRESENÇA
 * ======================================================= */

export async function getPresence():
  Promise<PresenceUser[]> {
  const currentSocket =
    connectSocket();

  await waitForConnection(
    currentSocket,
  );

  return new Promise<
    PresenceUser[]
  >(
    (
      resolve,
      reject,
    ) => {
      let finished =
        false;

      let timeout:
        | ReturnType<
            typeof setTimeout
          >
        | null = null;

      const cleanup =
        () => {
          if (timeout) {
            clearTimeout(
              timeout,
            );

            timeout = null;
          }

          currentSocket.off(
            "presence:list",
            handleList,
          );

          currentSocket.off(
            "presence:error",
            handleError,
          );
        };

      const handleList =
        (
          data: PresenceUser[],
        ) => {
          if (finished) {
            return;
          }

          finished = true;

          cleanup();

          /*
           * Atualiza o Zustand
           * imediatamente.
           */
          usePresenceStore
            .getState()
            .setPresenceList(
              data,
            );

          resolve(data);
        };

      const handleError =
        (
          data: ChatErrorData,
        ) => {
          if (finished) {
            return;
          }

          finished = true;

          cleanup();

          reject(
            new Error(
              data?.message ??
                "Não foi possível carregar a presença dos usuários.",
            ),
          );
        };

      timeout =
        setTimeout(
          () => {
            if (finished) {
              return;
            }

            finished = true;

            cleanup();

            reject(
              new Error(
                "Tempo esgotado ao carregar presença dos usuários.",
              ),
            );
          },
          10000,
        );

      currentSocket.once(
        "presence:list",
        handleList,
      );

      currentSocket.once(
        "presence:error",
        handleError,
      );

      currentSocket.emit(
        "presence:get",
      );
    },
  );
}

export function onPresenceChanged(
  callback: (
    data: PresenceChangedData,
  ) => void,
): () => void {
  const currentSocket =
    connectSocket();

  currentSocket.on(
    "presence:changed",
    callback,
  );

  return () => {
    currentSocket.off(
      "presence:changed",
      callback,
    );
  };
}

/* =========================================================
 * LISTENERS DE MENSAGENS
 * ======================================================= */

export async function joinNotifications(): Promise<void> {
  notificationsRoomRequested = true;

  const currentSocket = connectSocket();

  if (
    joinedNotifications &&
    currentSocket.connected
  ) {
    return;
  }

  if (notificationsJoinPromise) {
    return notificationsJoinPromise;
  }

  const generation =
    notificationsJoinGeneration;

  const pendingJoin = (async () => {
    await waitForConnection(currentSocket);

    if (
      generation !==
        notificationsJoinGeneration ||
      !notificationsRoomRequested ||
      socket !== currentSocket ||
      !currentSocket.connected
    ) {
      return;
    }

    if (!joinedNotifications) {
      currentSocket.emit(
        "notifications:join",
      );
      joinedNotifications = true;
    }
  })();

  notificationsJoinPromise = pendingJoin;

  try {
    await pendingJoin;
  } finally {
    if (
      notificationsJoinPromise ===
      pendingJoin
    ) {
      notificationsJoinPromise = null;
    }
  }
}

export function leaveNotifications(): void {
  notificationsRoomRequested = false;
  notificationsJoinGeneration += 1;
  notificationsJoinPromise = null;

  if (
    socket?.connected &&
    joinedNotifications
  ) {
    socket.emit(
      "notifications:leave",
    );
  }

  joinedNotifications = false;
}

export function onNewNotification(callback: (notification: SocketNotification) => void): () => void { const currentSocket = connectSocket(); currentSocket.on("notification:new", callback); return () => currentSocket.off("notification:new", callback); }

export function onNewMessage(
  callback: (
    message: ServerMessage,
  ) => void,
): () => void {
  const currentSocket =
    connectSocket();

  currentSocket.on(
    "message:new",
    callback,
  );

  return () => {
    currentSocket.off(
      "message:new",
      callback,
    );
  };
}

export function onNewDirectMessage(
  callback: (
    message: DirectServerMessage,
  ) => void,
): () => void {
  const currentSocket =
    connectSocket();

  currentSocket.on(
    "direct:message:new",
    callback,
  );

  return () => {
    currentSocket.off(
      "direct:message:new",
      callback,
    );
  };
}

/* =========================================================
 * LISTENERS DE CHAT DE GRUPO
 * ======================================================= */

export function onChatJoined(
  callback: (
    data: {
      groupId: string;
    },
  ) => void,
): () => void {
  const currentSocket =
    connectSocket();

  currentSocket.on(
    "chat:joined",
    callback,
  );

  return () => {
    currentSocket.off(
      "chat:joined",
      callback,
    );
  };
}

export function onChatLeft(
  callback: (
    data: {
      groupId: string;
    },
  ) => void,
): () => void {
  const currentSocket =
    connectSocket();

  currentSocket.on(
    "chat:left",
    callback,
  );

  return () => {
    currentSocket.off(
      "chat:left",
      callback,
    );
  };
}

export function onChatError(
  callback: (
    data: ChatErrorData,
  ) => void,
): () => void {
  const currentSocket =
    connectSocket();

  currentSocket.on(
    "chat:error",
    callback,
  );

  return () => {
    currentSocket.off(
      "chat:error",
      callback,
    );
  };
}

/* =========================================================
 * LISTENER DE ERRO DO CHAT PRIVADO
 * ======================================================= */

export function onDirectChatError(
  callback: (
    data: ChatErrorData,
  ) => void,
): () => void {
  const currentSocket =
    connectSocket();

  currentSocket.on(
    "direct:chat:error",
    callback,
  );

  return () => {
    currentSocket.off(
      "direct:chat:error",
      callback,
    );
  };
}
/* =========================================================
 * LOCALIZAÇÃO EM TEMPO REAL
 * ======================================================= */

/**
 * Entra na sala privada de localização.
 *
 * O backend responde através de ACK:
 *
 * {
 *   event: "location:joined",
 *   data: {
 *     userId: string
 *   }
 * }
 */
export async function joinLocationRoom(): Promise<void> {
  if (joinedLocationRoom) {
    return;
  }

  if (locationJoinPromise) {
    return locationJoinPromise;
  }

  locationJoinPromise =
    new Promise<void>(
      async (
        resolve,
        reject,
      ) => {
        try {
          const currentSocket =
            connectSocket();

          await waitForConnection(
            currentSocket,
          );

          if (joinedLocationRoom) {
            resolve();
            return;
          }

          let finished = false;

          const timeout =
            setTimeout(() => {
              if (finished) {
                return;
              }

              finished = true;

              reject(
                new Error(
                  "Tempo esgotado ao entrar na sala de localização.",
                ),
              );
            }, 10000);

          currentSocket.emit(
            "location:join",
            (response: unknown) => {
              if (finished) {
                return;
              }

              finished = true;

              clearTimeout(timeout);

              const result =
                response as
                  | {
                      event?: string;
                      data?: {
                        userId?: string;
                        code?: string;
                        message?: string;
                      };
                    }
                  | undefined;

              if (
                result?.event ===
                "location:joined"
              ) {
                joinedLocationRoom = true;
                resolve();
                return;
              }

              reject(
                new Error(
                  result?.data?.message ??
                    "Não foi possível entrar na sala de localização.",
                ),
              );
            },
          );
        } catch (error) {
          reject(error);
        }
      },
    );

  try {
    await locationJoinPromise;
  } finally {
    locationJoinPromise = null;
  }
}

/**
 * Sai da sala de localização.
 */
export function leaveLocationRoom(): void {
  if (!socket || !socket.connected) {
    joinedLocationRoom = false;
    return;
  }

  socket.emit(
    "location:leave",
    (response: unknown) => {
      console.log(
        "[Socket.IO] location:left:",
        response,
      );
    },
  );

  joinedLocationRoom = false;
}

/**
 * Atualiza a localização do usuário.
 */
export async function updateSocketLocation(
  latitude: number,
  longitude: number,
): Promise<LocationSavedData> {

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error(
      "Latitude e longitude devem ser números válidos.",
    );
  }

  if (
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error(
      "Latitude deve estar entre -90 e 90.",
    );
  }

  if (
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "Longitude deve estar entre -180 e 180.",
    );
  }

  const currentSocket =
    connectSocket();

  await waitForConnection(
    currentSocket,
  );

  if (!joinedLocationRoom) {
    await joinLocationRoom();
  }

  return new Promise<LocationSavedData>(
    (
      resolve,
      reject,
    ) => {
      let finished = false;

      const timeout =
        setTimeout(() => {
          if (finished) {
            return;
          }

          finished = true;

          reject(
            new Error(
              "Tempo esgotado ao atualizar localização.",
            ),
          );
        }, 10000);

      currentSocket.emit(
        "location:update",
        {
          latitude,
          longitude,
        },
        (response: unknown) => {
          if (finished) {
            return;
          }

          finished = true;

          clearTimeout(timeout);

          const result =
            response as
              | {
                  event?: string;
                  data?: LocationSavedData & {
                    code?: string;
                    message?: string;
                  };
                }
              | undefined;

          if (
            result?.event ===
              "location:saved" &&
            result.data
          ) {
            resolve(
              result.data,
            );

            return;
          }

          reject(
            new Error(
              result?.data?.message ??
                "Não foi possível atualizar a localização.",
            ),
          );
        },
      );
    },
  );
}

/**
 * Escuta atualizações de localização
 * enviadas pelo backend.
 */
export function onLocationUpdated(
  callback: (
    data: LocationUpdatedData,
  ) => void,
): () => void {

  const currentSocket =
    connectSocket();

  currentSocket.on(
    "location:updated",
    callback,
  );

  return () => {
    currentSocket.off(
      "location:updated",
      callback,
    );
  };
}

