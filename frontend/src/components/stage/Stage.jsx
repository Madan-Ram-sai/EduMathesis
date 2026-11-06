import { AnimatePresence, motion } from "framer-motion";
import { usePrefs } from "../../context/PrefsContext";
import { CHARACTERS } from "../mascot/characters";
import { Layer } from "../../hooks/Parallax";
import { SineBoard, StepsBoard } from "./Board";
import ChatCard from "./ChatCard";
import Tabs from "./Tabs";
import Ambient from "./Ambient";
import useStageClock from "./useStageClock";
import useChatSequence from "./useChatSequence";

export default function Stage({ variant }) {
  const { mascot } = usePrefs();
  const teacher = CHARACTERS[mascot] || CHARACTERS.pi;
  const { mode, run, sec, p, jump } = useStageClock(10);
  const chat = useChatSequence(mode === "chat", run, teacher.name);
  const Board = variant === "steps" ? StepsBoard : SineBoard;

  return (
    <div className="stage">
      <Layer depth={8} className="swap-wrap">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${run}`}
            className="swap"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -8 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {mode === "lesson" ? <Board p={p} sec={sec} /> : <ChatCard s={chat} teacher={teacher} />}
          </motion.div>
        </AnimatePresence>
      </Layer>
      <Tabs mode={mode} sec={sec} p={p} onJump={jump} />
      <Ambient s={chat} teacher={teacher} />
    </div>
  );
}