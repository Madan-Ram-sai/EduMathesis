import { useEffect, useState } from "react";

const init = { msgs: [], typing: null, flight: null, toast: null };

export default function useChatSequence(active, run, teacherName) {
  const [s, set] = useState(init);

  useEffect(() => {
    set(init);
    if (!active) return;
    const add = (m) => (v) => ({ msgs: [...v.msgs, m] });
    const tl = [
      [300, () => ({ typing: "s" })],
      [1300, () => ({ typing: null, flight: { id: 1, from: "s" } })],
      [1950, add({ id: 1, who: "s", text: "Stuck on Q3 of the assignment" })],
      [2800, () => ({ typing: "t" })],
      [3900, () => ({ typing: null, flight: { id: 2, from: "t" } })],
      [4550, add({ id: 2, who: "t", text: "Think recursion: base case first.", file: "recursion_notes.pdf" })],
      [5400, (v) => ({ msgs: v.msgs.map((m) => (m.id === 2 ? { ...m, react: "+1" } : m)) })],
      [6200, () => ({ typing: "s" })],
      [7100, () => ({ typing: null, flight: { id: 3, from: "s" } })],
      [7750, add({ id: 3, who: "s", text: "Got it, thank you!" })],
      [8300, () => ({ toast: { id: 1, title: "New assignment uploaded", sub: `${teacherName} · CSE-2026` } })],
    ];
    const ids = tl.map(([at, fn]) => setTimeout(() => set((v) => ({ ...v, ...fn(v) })), at));
    return () => ids.forEach(clearTimeout);
  }, [active, run, teacherName]);

  return s;
}