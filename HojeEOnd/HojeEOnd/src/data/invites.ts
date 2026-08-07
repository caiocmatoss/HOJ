export type Invite = {


  id:string;


  groupId:string;


  fromUserId:string;


  toUserId:string;


  status:
    "pending"
    |
    "accepted"
    |
    "rejected";


};




export const invites:Invite[] = [];