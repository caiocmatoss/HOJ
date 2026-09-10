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
