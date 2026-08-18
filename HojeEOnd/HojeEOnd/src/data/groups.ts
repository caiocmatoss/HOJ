export type Group = {
  id: string;

  name: string;

  venueId: string;

  members: string[];
};

export const groups: Group[] = [
  {
    id: "1",

    name:
      "Rolê Sexta 🎧",

    venueId:
      "1",

    members: [
      "1",
      "2",
      "3",
    ],
  },

  {
    id: "2",

    name:
      "Cinema 🎬",

    venueId:
      "2",

    members: [
      "1",
      "2",
    ],
  },

  {
    id: "3",

    name:
      "Festas 🎉",

    venueId:
      "3",

    members: [
      "1",
      "3",
    ],
  },
];