export const venueKeys = {
  all: ["venues"] as const,
  list: (params: Record<string, unknown> = {}) => ["venues", "list", params] as const,
  detail: (id: string) => ["venues", "detail", id] as const,
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
