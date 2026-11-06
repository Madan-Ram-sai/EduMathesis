/** The little cast shown on the login/register pages. `seed` + `bg` pick the DiceBear face. */
export const people = {
  aarav: { name: "Aarav", role: "student", seed: "Aarav", bg: "b6e3f4", color: "var(--sky)" },
  meera: { name: "Meera", role: "student", seed: "Meera", bg: "ffd5dc", color: "var(--rose)" },
  rao: { name: "Prof. Rao", role: "teacher", seed: "Professor", bg: "ffe9a8", color: "var(--sun)" },
  isha: { name: "Isha", role: "student", seed: "Isha", bg: "d1f4d9", color: "var(--mint)" },
  kabir: { name: "Kabir", role: "student", seed: "Kabir", bg: "e4d8ff", color: "var(--lilac)" },
};

/** One chat per page. `endTyping` = who is shown "typing…" when the chat finishes. */
export const chats = {
  register: {
    room: "cse-study-room",
    cast: ["aarav", "meera"],
    msgs: [
      { who: "aarav", text: "Anyone have notes for Lecture 5? 📚" },
      { who: "meera", text: "Sharing the PDF now!", file: "DSA_notes.pdf", react: "🙌" },
      { who: "aarav", text: "You're a lifesaver!" },
    ],
    endTyping: "meera",
  },
  login: {
    room: "cse-study-room",
    cast: ["meera", "rao"],
    msgs: [
      { who: "meera", text: "Stuck on Q3 of the assignment 😅" },
      { who: "rao", text: "Think recursion: base case first 💡", file: "recursion_notes.pdf", react: "🤯" },
      { who: "meera", text: "Got it, thank you!" },
    ],
    endTyping: "rao",
  },
};

export const todo = ["Finish DSA sheet", "Answer Meera's doubt", "Submit lab report"];

export const notices = {
  lesson: { key: "lesson", title: "Prof. Rao is teaching", sub: "Today's lesson · 48 watching", bell: false },
  chat: { key: "chat", title: "New assignment uploaded", sub: "Prof. Rao · CSE-2026", bell: true },
};
