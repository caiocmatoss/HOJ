export type InviteStatus =
  | "pending"
  | "accepted"
  | "rejected";

export type InviteUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status: string;
};

export type InviteGroup = {
  id: string;
  name: string;
  venueId: string;
};

export type Invite = {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  status: InviteStatus;
  createdAt?: string;
  respondedAt?: string | null;
  group?: InviteGroup;
  sender?: InviteUser;
  receiver?: InviteUser;
};