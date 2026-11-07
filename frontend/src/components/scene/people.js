/** The little cast shown on the login/register pages. `seed` + `bg` pick the DiceBear face. */
export const people = {
  aarav: { name: "Aarav", role: "student", seed: "Aarav", bg: "b6e3f4", color: "var(--sky)" },
  meera: { name: "Meera", role: "student", seed: "Meera", bg: "ffd5dc", color: "var(--rose)" },
  rao: { name: "Prof. Rao", role: "teacher", seed: "Professor", bg: "ffe9a8", color: "var(--sun)" },
  isha: { name: "Isha", role: "student", seed: "Isha", bg: "d1f4d9", color: "var(--mint)" },
  kabir: { name: "Kabir", role: "student", seed: "Kabir", bg: "e4d8ff", color: "var(--lilac)" },
};

/** Several chats, one after the other, each between different people (loops forever). */
export const scripts = [
  {
    cast: ["aarav", "meera"],
    msgs: [
      { who: "aarav", text: "Anyone have notes for Lecture 5? 📚" },
      { who: "meera", text: "Sharing the PDF now!", file: "DSA_notes.pdf", react: "🙌" },
    ],
  },
  {
    cast: ["meera", "rao"],
    msgs: [
      { who: "meera", text: "Stuck on Q3 of the assignment 😅" },
      { who: "rao", text: "Think recursion: base case first 💡", file: "recursion_notes.pdf", react: "🤯" },
    ],
  },
  {
    cast: ["rao", "aarav"],
    msgs: [
      {
        who: "rao",
        text: "Posted a new assignment. Due Friday ✍️",
        toast: { title: "New assignment uploaded", sub: "Prof. Rao · CSE-2026" },
      },
      { who: "aarav", text: "On it! Starting tonight", react: "🔥" },
    ],
  },
  {
    cast: ["isha", "kabir"],
    msgs: [
      { who: "isha", text: "Study group at 6 in the library?" },
      { who: "kabir", text: "I'm in! Bringing the lab report", react: "👍" },
    ],
  },
];

export const ROOM = "cse-study-room";

/** Each page starts the loop at a different chat so login and register don't look identical. */
export const chatsFor = (variant) => {
  const start = variant === "login" ? 1 : 0;
  return [...scripts.slice(start), ...scripts.slice(0, start)];
};

export const todo = ["Finish DSA sheet", "Answer Meera's doubt", "Submit lab report"];

export const notices = {
  lesson: { key: "lesson", title: "Prof. Rao is teaching", sub: "Today's lesson · 48 watching", bell: false },
};
