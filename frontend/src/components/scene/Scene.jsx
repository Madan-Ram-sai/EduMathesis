import { useEffect, useState } from "react";
import { BookOpen, MessageCircle } from "lucide-react";
import Board from "./Board";
import ChatCard from "./ChatCard";
import TodoNote from "./TodoNote";
import CommunityChip from "./CommunityChip";
import NoticeCard from "./NoticeCard";
import GlassCard from "../ui/GlassCard";
import { useScene } from "./SceneContext";
import { chatsFor, notices } from "./people";
import { prefersReducedMotion } from "../../utils/validate";

const SCENE_MS = 10000; // hidden timer: how long each scene is on screen before the next one (until you click a tab)

const TABS = [
  { id: "lesson", label: "Lesson", Icon: BookOpen },
  { id: "chat", label: "Chat", Icon: MessageCircle },
];

/**
 * One stage with two layers: the green board and the chat.
 *  - They play one after the other (board first), switching on a hidden timer.
 *  - Click a tab and it STAYS on that tab (the timer stops).
 *  - Both keep running in the background; switching tabs never restarts either of them.
 * Remount with a new `key` (AuthLayout does this per page) to replay from the start.
 */
export default function Scene({ variant = "register" }) {
  const scene = useScene();
  const auto = !prefersReducedMotion();
  const [stage, setStage] = useState("lesson");
  const [locked, setLocked] = useState(false);
  const [chatLive, setChatLive] = useState(false); // the chat starts the first time it is shown, then never stops
  const [toast, setToast] = useState(null);

  if (stage === "chat" && !chatLive) setChatLive(true);

  useEffect(() => {
    if (!auto || locked) return;
    const t = setTimeout(() => setStage((s) => (s === "lesson" ? "chat" : "lesson")), SCENE_MS);
    return () => clearTimeout(t);
  }, [stage, locked, auto]);

  const pick = (id) => {
    setLocked(true);
    setStage(id);
  };

  const notice = stage === "lesson" ? notices.lesson : toast;

  return (
    <div className="scene">
      <div className="showbox">
        <div className={`layer ${stage === "lesson" ? "on" : ""}`} aria-hidden={stage !== "lesson"}>
          <Board variant={variant} mood={scene?.mood} />
        </div>
        {chatLive && (
          <div className={`layer ${stage === "chat" ? "on" : ""}`} aria-hidden={stage !== "chat"}>
            <ChatCard scripts={chatsFor(variant)} onToast={setToast} />
          </div>
        )}
      </div>

      <GlassCard className="stage-tabs" role="tablist" aria-label="Preview">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={stage === id} className={`stage-tab ${stage === id ? "on" : ""}`} onClick={() => pick(id)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </GlassCard>
      <p className="stage-hint">Plays one after the other. Click a tab to stay on it.</p>

      <div className="below">
        <TodoNote />
        <div className="below-right">
          <CommunityChip />
          <NoticeCard notice={notice} />
        </div>
      </div>
    </div>
  );
}
