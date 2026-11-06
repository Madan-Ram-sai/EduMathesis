import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, MessageCircle } from "lucide-react";
import Board from "./Board";
import ChatCard from "./ChatCard";
import TodoNote from "./TodoNote";
import CommunityChip from "./CommunityChip";
import NoticeCard from "./NoticeCard";
import GlassCard from "../ui/GlassCard";
import { useScene } from "./SceneContext";
import { chats, notices } from "./people";
import { prefersReducedMotion } from "../../utils/validate";

const SCENE_MS = 10000; // each scene plays for 10 s, then the next one takes over
const clock = (s) => `0:${String(Math.min(s, 10)).padStart(2, "0")}/0:10`;

const TABS = [
  { id: "lesson", label: "Lesson", Icon: BookOpen },
  { id: "chat", label: "Chat", Icon: MessageCircle },
];

/**
 * ONE stage that plays the green board first, then the chat, one after the other (then it loops).
 * The tabs show progress and are clickable: click one to jump straight to that scene.
 * Remount with a new `key` (AuthLayout does this per page) to replay from the start.
 */
export default function Scene({ variant = "register" }) {
  const scene = useScene();
  const auto = !prefersReducedMotion();
  const [stage, setStage] = useState("lesson");
  const [run, setRun] = useState(0); // bump to restart the current scene (clicking its own tab)
  const [sec, setSec] = useState(0);
  const [done, setDone] = useState({ lesson: false, chat: false });

  useEffect(() => {
    if (!auto) return;
    setSec(0);
    const tick = setInterval(() => setSec((s) => s + 1), 1000);
    const next = setTimeout(() => {
      setDone((d) => ({ ...d, [stage]: true }));
      setStage((s) => (s === "lesson" ? "chat" : "lesson"));
    }, SCENE_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(next);
    };
  }, [stage, run, auto]);

  const jump = (id) => {
    setStage(id);
    setRun((r) => r + 1);
  };

  const notice = stage === "chat" && sec < 4 ? null : notices[stage];

  return (
    <div className="scene">
      <div className="showbox">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${stage}-${run}`}
            className="showbox-in"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {stage === "lesson" ? (
              <Board variant={variant} mood={scene?.mood} sec={auto ? sec : 5} />
            ) : (
              <ChatCard script={chats[variant] || chats.register} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <GlassCard className="stage-tabs" role="tablist" aria-label="Preview">
        {TABS.map(({ id, label, Icon }) => {
          const on = stage === id;
          return (
            <button key={id} type="button" role="tab" aria-selected={on} className={`stage-tab ${on ? "on" : ""}`} onClick={() => jump(id)}>
              {on && auto && <i key={`${stage}-${run}`} className="fill" style={{ "--ms": `${SCENE_MS}ms` }} />}
              <span className="lbl"><Icon size={15} /> {label}</span>
              <small>{on ? clock(sec) : done[id] ? "done" : "next"}</small>
            </button>
          );
        })}
      </GlassCard>
      <p className="stage-hint">Plays one after the other. Click a tab to jump.</p>

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
