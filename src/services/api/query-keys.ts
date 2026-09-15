export const venueKeys = {
  all: ["venues"] as const,
  list: (params: Record<string, unknown> = {}) => ["venues", "list", params] as const,
  detail: (id: string) => ["venues", "detail", id] as const,
};
export const venuePresenceKeys = { all: ["venue-presence"] as const, detail: (venueId: string) => ["venue-presence", venueId] as const };
export const discoveryKeys = {
  all: ["discovery"] as const,
  nearby: (lat: number, lng: number, radius: number) => ["discovery", "nearby", lat, lng, radius] as const,
};

export const eventKeys = {
  all: ["events"] as const,
  list: (params: Record<string, unknown> = {}) => ["events", "list", params] as const,
  detail: (id: string) => ["events", "detail", id] as const,
};

export const favoriteKeys = { all: ["favorites"] as const };
export const checkinKeys = {
  active: ["checkins", "active"] as const,
  history: (params: Record<string, unknown> = {}) => ["checkins", "history", params] as const,
};

export const friendKeys = { all: ['friends'] as const, list: (params: Record<string, unknown> = {}) => ['friends', 'list', params] as const, requests: (params: Record<string, unknown> = {}) => ['friends', 'requests', params] as const, detail: (id: string) => ['friends', 'detail', id] as const };
export const groupKeys = { all: ['groups'] as const, list: (params: Record<string, unknown> = {}) => ['groups', 'list', params] as const, detail: (id: string) => ['groups', 'detail', id] as const, members: (id: string, params: Record<string, unknown> = {}) => ['groups', 'members', id, params] as const };
export const inviteKeys = { all: ['invites'] as const, received: (params: Record<string, unknown> = {}) => ['invites', 'received', params] as const, sent: (params: Record<string, unknown> = {}) => ['invites', 'sent', params] as const };
export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params: Record<string, unknown> = {}) => ["notifications", "list", params] as const,
  unread: (params: Record<string, unknown> = {}) => ["notifications", "unread", params] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};
export const pushDeviceKeys = { all: ["push-devices"] as const, list: ["push-devices", "list"] as const };
export const messageKeys = {
  all: ["messages"] as const,
  inbox: (params: Record<string, unknown> = {}) => ["messages", "inbox", params] as const,
  unreadCount: ["messages", "unread-count"] as const,
  directReadState: (userId: string) => ["messages", "direct-read-state", userId] as const,
  group: (id: string, params: Record<string, unknown> = {}) => ["messages", "group", id, params] as const,
  direct: (id: string, params: Record<string, unknown> = {}) => ["messages", "direct", id, params] as const,
};
