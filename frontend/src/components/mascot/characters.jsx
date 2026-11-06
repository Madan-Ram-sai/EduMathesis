import Eyes from "./Eyes";

const K = "#22304D";
const S = { stroke: K, strokeWidth: 3.5, strokeLinejoin: "round", strokeLinecap: "round" };

const Cheek = ({ x, y }) => <circle cx={x} cy={y} r="6.5" fill="#FF9DB0" opacity=".6" />;
const Smile = ({ x, y, w = 18 }) => <path d={`M${x} ${y}q${w / 2} ${w * 0.5} ${w} 0`} fill="none" {...S} />;
const Shoe = ({ x, y, c }) => <ellipse cx={x} cy={y} rx="16" ry="8" fill={c} {...S} />;

const Arm = ({ sx, sy, hx, hy, c }) => {
  const d = `M${sx} ${sy}Q${(sx + hx) / 2 - 4} ${(sy + hy) / 2 + 12} ${hx} ${hy}`;
  return (
    <g className="arm">
      <path d={d} fill="none" stroke={K} strokeWidth="10" strokeLinecap="round" />
      <path d={d} fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
      <path d={`M${hx} ${hy}l-38 -34`} stroke="#E7C888" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx={hx} cy={hy} r="7" fill={c} {...S} />
    </g>
  );
};

const Hang = ({ sx, sy, c }) => {
  const d = `M${sx} ${sy}q24 8 18 36`;
  return (
    <g>
      <path d={d} fill="none" stroke={K} strokeWidth="10" strokeLinecap="round" />
      <path d={d} fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
      <circle cx={sx + 18} cy={sy + 36} r="7" fill={c} {...S} />
    </g>
  );
};

const Cap = ({ y }) => (
  <g transform={`translate(0 ${y})`}>
    <path d="M74 46v14q26 14 52 0V46" fill="#2F3E6B" {...S} />
    <path d="M40 36L100 12L160 36L100 60Z" fill="#2F3E6B" {...S} />
    <path d="M150 38q9 16 4 32" fill="none" stroke="#FF9DB0" strokeWidth="4" strokeLinecap="round" />
    <circle cx="154" cy="72" r="5" fill="#FF9DB0" {...S} strokeWidth="2.5" />
  </g>
);

const Pi = ({ look, shy }) => (
  <g>
    <rect x="72" y="150" width="25" height="60" rx="11" fill="#FFC94A" {...S} />
    <rect x="104" y="150" width="25" height="60" rx="11" fill="#FFC94A" {...S} />
    <Shoe x={84} y={214} c="#F08A70" />
    <Shoe x={118} y={214} c="#F08A70" />
    <Hang sx={154} sy={116} c="#FFC94A" />
    <rect x="46" y="76" width="108" height="86" rx="40" fill="#FFC94A" {...S} />
    <Eyes pts={[[80, 114], [120, 114]]} r={16} pr={5.5} look={look} shy={shy} />
    <path d="M96 114h8" fill="none" {...S} />
    <Smile x={92} y={136} />
    <Cheek x={62} y={132} />
    <Cheek x={138} y={132} />
    <Cap y={36} />
    <Arm sx={50} sy={118} hx={14} hy={92} c="#FFC94A" />
  </g>
);

const Hoot = ({ look, shy }) => (
  <g>
    <path d="M84 206l-8 12M84 206v13M84 206l8 12M116 206l-8 12M116 206v13M116 206l8 12" stroke="#FF9A4D" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    <ellipse cx="100" cy="146" rx="54" ry="64" fill="#B7A6F5" {...S} />
    <ellipse cx="100" cy="168" rx="34" ry="38" fill="#E6DEFF" stroke={K} strokeWidth="2.5" />
    <path d="M84 158q8 8 16 0M100 158q8 8 16 0M92 176q8 8 16 0M76 178q8 8 16 0M108 178q8 8 16 0" fill="none" stroke="#9C89EA" strokeWidth="3" strokeLinecap="round" />
    <Hang sx={152} sy={134} c="#9C89EA" />
    <Eyes pts={[[78, 114], [122, 114]]} r={20} pr={8} look={look} shy={shy} />
    <path d="M91 128h18l-9 16z" fill="#FF9A4D" {...S} />
    <Cap y={34} />
    <Arm sx={50} sy={136} hx={14} hy={108} c="#9C89EA" />
  </g>
);

const Chalkie = ({ look, shy }) => (
  <g>
    <path d="M90 182l-6 28M112 182l8 28" stroke={K} strokeWidth="5" strokeLinecap="round" fill="none" />
    <Shoe x={80} y={214} c="#8CC5FF" />
    <Shoe x={124} y={214} c="#8CC5FF" />
    <Hang sx={138} sy={122} c="#FFB3C7" />
    <g transform="rotate(-6 100 130)">
      <rect x="62" y="66" width="76" height="118" rx="16" fill="#FFB3C7" {...S} />
      <rect x="62" y="66" width="76" height="28" rx="14" fill="#FFFFFF" {...S} />
      <Eyes pts={[[84, 122], [116, 122]]} r={10} pr={4} look={look} shy={shy} />
      <Smile x={90} y={144} />
      <Cheek x={72} y={140} />
      <Cheek x={128} y={140} />
    </g>
    <Arm sx={64} sy={126} hx={20} hy={100} c="#FFB3C7" />
  </g>
);

const Byte = ({ look, shy }) => (
  <g>
    <rect x="78" y="184" width="17" height="26" rx="6" fill="#8CC5FF" {...S} />
    <rect x="106" y="184" width="17" height="26" rx="6" fill="#8CC5FF" {...S} />
    <rect x="70" y="206" width="30" height="13" rx="6" fill="#F08A70" {...S} />
    <rect x="102" y="206" width="30" height="13" rx="6" fill="#F08A70" {...S} />
    <Hang sx={132} sy={140} c="#8CC5FF" />
    <rect x="68" y="120" width="64" height="66" rx="16" fill="#8DD5B4" {...S} />
    <circle cx="100" cy="152" r="9" fill="#FFD166" {...S} />
    <path d="M100 46v-16" fill="none" {...S} />
    <circle cx="100" cy="26" r="6.5" fill="#F08A70" {...S} />
    <rect x="52" y="46" width="96" height="76" rx="22" fill="#8CC5FF" {...S} />
    <rect x="62" y="56" width="76" height="56" rx="14" fill="#22304D" />
    <Eyes pts={[[82, 80], [118, 80]]} r={9} pr={3.5} look={look} shy={shy} fill="#8DD5B4" stroke="#8DD5B4" />
    <path d="M90 98q10 9 20 0" fill="none" stroke="#8DD5B4" strokeWidth="3.5" strokeLinecap="round" />
    <Arm sx={68} sy={142} hx={26} hy={112} c="#8CC5FF" />
  </g>
);

const Newton = ({ look, shy }) => (
  <g>
    <path d="M86 184v26M116 184v26" stroke={K} strokeWidth="5" strokeLinecap="round" fill="none" />
    <Shoe x={84} y={214} c="#7FD6A8" />
    <Shoe x={118} y={214} c="#7FD6A8" />
    <Hang sx={152} sy={128} c="#F4806F" />
    <path d="M100 74C70 52 36 84 44 138C50 184 80 196 100 186C120 196 150 184 156 138C164 84 130 52 100 74Z" fill="#F4806F" {...S} />
    <path d="M64 100q-8 18-4 36" fill="none" stroke="#FFC4B8" strokeWidth="6" strokeLinecap="round" />
    <path d="M100 76q2-18 12-26" fill="none" stroke="#8B5E3C" strokeWidth="6" strokeLinecap="round" />
    <path d="M106 62q18-18 38-6q-10 20-38 6Z" fill="#7FD6A8" {...S} />
    <Eyes pts={[[80, 124], [120, 124]]} r={12} pr={4.8} look={look} shy={shy} />
    <Smile x={90} y={146} />
    <Cheek x={62} y={142} />
    <Cheek x={138} y={142} />
    <Arm sx={50} sy={132} hx={14} hy={104} c="#F4806F" />
  </g>
);

const Beaker = ({ look, shy }) => (
  <g>
    <path d="M82 198v14M118 198v14" stroke={K} strokeWidth="5" strokeLinecap="round" fill="none" />
    <Shoe x={80} y={216} c="#FFD166" />
    <Shoe x={120} y={216} c="#FFD166" />
    <Hang sx={148} sy={152} c="#E4F1FF" />
    <rect x="84" y="64" width="32" height="44" rx="6" fill="#E4F1FF" {...S} />
    <path d="M84 102L46 176Q40 198 62 199H138Q160 198 154 176L116 102Z" fill="#E4F1FF" {...S} />
    <path d="M64 142H136L153 176Q159 197 138 198H62Q41 197 47 176Z" fill="#8DD5B4" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
    <circle cx="86" cy="124" r="4.5" fill="#fff" {...S} strokeWidth="2.5" />
    <circle cx="112" cy="112" r="5.5" fill="#fff" {...S} strokeWidth="2.5" />
    <rect x="80" y="54" width="40" height="14" rx="5" fill="#C99A6B" {...S} />
    <Eyes pts={[[84, 166], [116, 166]]} r={11} pr={4.5} look={look} shy={shy} />
    <Smile x={91} y={184} />
    <Cheek x={66} y={182} />
    <Cheek x={134} y={182} />
    <Arm sx={56} sy={160} hx={16} hy={128} c="#E4F1FF" />
  </g>
);

const Atom = ({ look, shy }) => (
  <g>
    <g className="spin">
      <ellipse cx="100" cy="140" rx="86" ry="28" transform="rotate(28 100 140)" fill="none" stroke="#8CC5FF" strokeWidth="4" />
      <circle cx="172" cy="162" r="7" fill="#FFD166" {...S} />
    </g>
    <g className="spin rev">
      <ellipse cx="100" cy="140" rx="86" ry="28" transform="rotate(-28 100 140)" fill="none" stroke="#C9B6FF" strokeWidth="4" />
      <circle cx="28" cy="162" r="7" fill="#F08A70" {...S} />
    </g>
    <path d="M88 184v26M112 184v26" stroke={K} strokeWidth="5" strokeLinecap="round" fill="none" />
    <Shoe x={86} y={214} c="#F08A70" />
    <Shoe x={114} y={214} c="#F08A70" />
    <Hang sx={142} sy={144} c="#8CC5FF" />
    <circle cx="100" cy="140" r="46" fill="#8CC5FF" {...S} />
    <Eyes pts={[[84, 134], [116, 134]]} r={11} pr={4.5} look={look} shy={shy} />
    <Smile x={91} y={154} />
    <Cheek x={68} y={152} />
    <Cheek x={132} y={152} />
    <Arm sx={58} sy={146} hx={18} hy={116} c="#8CC5FF" />
  </g>
);

const Cosmo = ({ look, shy }) => (
  <g>
    <rect x="138" y="116" width="26" height="58" rx="9" fill="#C9B6FF" {...S} />
    <rect x="76" y="188" width="21" height="22" rx="8" fill="#F4F6FB" {...S} />
    <rect x="104" y="188" width="21" height="22" rx="8" fill="#F4F6FB" {...S} />
    <Shoe x={86} y={214} c="#F08A70" />
    <Shoe x={116} y={214} c="#F08A70" />
    <Hang sx={132} sy={144} c="#F4F6FB" />
    <rect x="66" y="128" width="68" height="68" rx="26" fill="#F4F6FB" {...S} />
    <rect x="86" y="150" width="28" height="16" rx="5" fill="#F08A70" {...S} strokeWidth="2.5" />
    <path d="M100 42v-12" fill="none" {...S} />
    <circle cx="100" cy="26" r="6" fill="#FFD166" {...S} />
    <circle cx="100" cy="92" r="50" fill="#F4F6FB" {...S} />
    <ellipse cx="100" cy="96" rx="38" ry="30" fill="#22304D" />
    <Eyes pts={[[86, 98], [114, 98]]} r={8.5} pr={3.4} look={look} shy={shy} stroke="#fff" />
    <path d="M91 114q9 7 18 0" fill="none" stroke="#8DD5B4" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M70 76q8-14 24-18" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    <Arm sx={66} sy={148} hx={22} hy={118} c="#F4F6FB" />
  </g>
);

export const CHARACTERS = {
  pi: { name: "Prof. Pi", tag: "A π with glasses and a mortarboard.", color: "#FFC94A", Art: Pi },
  hoot: { name: "Hoot", tag: "The classic wise-owl professor.", color: "#B7A6F5", Art: Hoot },
  chalkie: { name: "Chalkie", tag: "A living stick of chalk. Very blackboard.", color: "#FFB3C7", Art: Chalkie },
  byte: { name: "Byte", tag: "A friendly study-bot with a screen face.", color: "#8CC5FF", Art: Byte },
  newton: { name: "Newton", tag: "An apple that never falls far from the lesson.", color: "#F4806F", Art: Newton },
  beaker: { name: "Beaker", tag: "Your bubbly lab partner.", color: "#8DD5B4", Art: Beaker },
  atom: { name: "Atom", tag: "Tiny, but full of energy.", color: "#8CC5FF", Art: Atom },
  cosmo: { name: "Cosmo", tag: "Space-grade explainer.", color: "#C9B6FF", Art: Cosmo },
};
export const IDS = Object.keys(CHARACTERS);