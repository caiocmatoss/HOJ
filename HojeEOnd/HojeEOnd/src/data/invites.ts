export type Invite = {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
};

export const invites: Invite[] = [
  {
    id: "invite-1",
    groupId: "1",
    fromUserId: "2",
    toUserId: "1",
    status: "pending",
  },
  {
    id: "invite-2",
    groupId: "2",
    fromUserId: "3",
    toUserId: "1",
    status: "pending",
  },
];