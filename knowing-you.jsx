import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Flame, Shuffle, Check, ChevronDown, Pencil, X, BookHeart,
  RotateCcw, Heart, Users, Bell, Sparkles, LogIn, UserPlus,
  Star, TrendingUp, CalendarDays, Plus, ArrowLeft, Lock, LogOut, Quote,
  Settings2, Trash2, Copy, Clock, PlusCircle,
} from "lucide-react";

/* ---------------------------------------------------------
   Theming
--------------------------------------------------------- */
const NEUTRAL = {
  bg: "#EFEAE0", card: "#FFFDF8", ink: "#2B2A33", inkSoft: "#6B6875",
  accent: "#5B5A8C", accentSoft: "#E4E2F0", tabBg: "#E2DED2", pillBg: "#F5F2EA",
  border: "rgba(43,42,51,0.09)",
};

const THEMES = {
  romantic: {
    label: "Romantic", tagline: "One little question a day, for someone you love.",
    eyebrow: "Falling for", icon: Heart, extraCategory: "Us & Love",
    colors: {
      bg: "#F7ECE9", card: "#FFFBF7", ink: "#3B2430", inkSoft: "#8B6470",
      accent: "#A8375A", accentSoft: "#F3DCE1", tabBg: "#F0DADD", pillBg: "#FBEEEC",
      flame: "#C9784B", border: "rgba(59,36,48,0.09)",
    },
  },
  friends: {
    label: "Friends", tagline: "One little question a day, to know them better.",
    eyebrow: "Getting to know", icon: Users, extraCategory: "Friendship",
    colors: {
      bg: "#EFE9DC", card: "#FFFCF5", ink: "#2A2E3F", inkSoft: "#5B5F72",
      accent: "#6E7F5C", accentSoft: "#E3E8DB", tabBg: "#E3DCC9", pillBg: "#F6F2E8",
      flame: "#A85D42", border: "rgba(42,46,63,0.08)",
    },
  },
};

const AVATAR_PALETTE = ["#A8375A", "#6E7F5C", "#5B5A8C", "#C9784B", "#3F7D8C", "#8A5CA8"];
const TOTAL_QUESTIONS_PER_MODE = 54;
const ANSWER_MILESTONES = [7, 14, 30, 50, 75, 100];
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const OWN_CATEGORY = "Your Own Questions";

function pageBg(C) {
  return {
    background: C.bg,
    backgroundImage: `radial-gradient(${C.ink}0d 1px, transparent 1px), radial-gradient(620px circle at 88% -8%, ${C.accent}20, transparent 60%), radial-gradient(520px circle at -8% 108%, ${C.accent}16, transparent 60%)`,
    backgroundSize: "18px 18px, auto, auto",
  };
}

/* ---------------------------------------------------------
   Question bank
--------------------------------------------------------- */
const BASE_CATEGORIES = [
  "Childhood & Roots", "Everyday Life", "Tastes & Preferences", "Dreams & Fears",
  "Relationships & People", "Memories", "Values & Beliefs", "Fun & Quirks",
];

const BASE_QUESTIONS = [
  { id: "c1", cat: "Childhood & Roots", text: "What's a smell that instantly takes you back to your childhood?" },
  { id: "c2", cat: "Childhood & Roots", text: "What did your childhood bedroom look like?" },
  { id: "c3", cat: "Childhood & Roots", text: "Who was your childhood best friend, and what did you two get up to?" },
  { id: "c4", cat: "Childhood & Roots", text: "What's a rule from your childhood home you still follow (or love breaking)?" },
  { id: "c5", cat: "Childhood & Roots", text: "What did you want to be when you grew up, and why?" },
  { id: "c6", cat: "Childhood & Roots", text: "What's your earliest clear memory?" },
  { id: "e1", cat: "Everyday Life", text: "What does your ideal ordinary Tuesday look like?" },
  { id: "e2", cat: "Everyday Life", text: "What's the first thing you do when you get home?" },
  { id: "e3", cat: "Everyday Life", text: "What small daily ritual makes you feel most like yourself?" },
  { id: "e4", cat: "Everyday Life", text: "What's something that instantly puts you in a bad mood?" },
  { id: "e5", cat: "Everyday Life", text: "What do you usually think about right before falling asleep?" },
  { id: "e6", cat: "Everyday Life", text: "What's a chore you secretly don't mind doing?" },
  { id: "t1", cat: "Tastes & Preferences", text: "What's a food you could eat every day and never get tired of?" },
  { id: "t2", cat: "Tastes & Preferences", text: "What's your go-to comfort watch — a movie or show?" },
  { id: "t3", cat: "Tastes & Preferences", text: "Do you prefer mornings or nights, and why?" },
  { id: "t4", cat: "Tastes & Preferences", text: "What's a song that always gets you dancing?" },
  { id: "t5", cat: "Tastes & Preferences", text: "What's your favorite way to spend a rainy afternoon?" },
  { id: "t6", cat: "Tastes & Preferences", text: "Is there a smell or taste you can't stand?" },
  { id: "d1", cat: "Dreams & Fears", text: "What's something you've always wanted to try but haven't yet?" },
  { id: "d2", cat: "Dreams & Fears", text: "What does your ideal life five years from now look like?" },
  { id: "d3", cat: "Dreams & Fears", text: "What's a fear you've slowly gotten better at facing?" },
  { id: "d4", cat: "Dreams & Fears", text: "If money weren't a factor, what would you spend your days doing?" },
  { id: "d5", cat: "Dreams & Fears", text: "What's a place you've never been but dream of visiting?" },
  { id: "d6", cat: "Dreams & Fears", text: "What's something you hope people remember about you?" },
  { id: "r1", cat: "Relationships & People", text: "Who has shaped you the most, and how?" },
  { id: "r2", cat: "Relationships & People", text: "What do you value most in a friendship?" },
  { id: "r3", cat: "Relationships & People", text: "Who in your life makes you laugh the hardest?" },
  { id: "r4", cat: "Relationships & People", text: "What's the best piece of advice someone ever gave you?" },
  { id: "r5", cat: "Relationships & People", text: "How do you like to be comforted when you're having a hard day?" },
  { id: "r6", cat: "Relationships & People", text: "Who do you wish you kept in touch with more?" },
  { id: "m1", cat: "Memories", text: "What's a memory that still makes you smile every time you think of it?" },
  { id: "m2", cat: "Memories", text: "What's the most spontaneous thing you've ever done?" },
  { id: "m3", cat: "Memories", text: "What's a trip or outing you'll never forget?" },
  { id: "m4", cat: "Memories", text: "What's something you did as a kid that you're still proud of?" },
  { id: "m5", cat: "Memories", text: "What's a moment you felt truly proud of yourself?" },
  { id: "m6", cat: "Memories", text: "What's a memory tied to a specific piece of music?" },
  { id: "v1", cat: "Values & Beliefs", text: "What does \"success\" mean to you, personally?" },
  { id: "v2", cat: "Values & Beliefs", text: "What's a value you hope to pass on to others?" },
  { id: "v3", cat: "Values & Beliefs", text: "What's something you used to believe but changed your mind about?" },
  { id: "v4", cat: "Values & Beliefs", text: "What does \"home\" mean to you?" },
  { id: "v5", cat: "Values & Beliefs", text: "What's something you think is worth being stubborn about?" },
  { id: "v6", cat: "Values & Beliefs", text: "What's a small act of kindness you still think about?" },
  { id: "f1", cat: "Fun & Quirks", text: "What's a weird habit or quirk you have?" },
  { id: "f2", cat: "Fun & Quirks", text: "What's your most-used emoji, and why?" },
  { id: "f3", cat: "Fun & Quirks", text: "What's a hill you'll die on that's actually pretty silly?" },
  { id: "f4", cat: "Fun & Quirks", text: "If you had a theme song, what would it be?" },
  { id: "f5", cat: "Fun & Quirks", text: "What's the most useless talent you have?" },
  { id: "f6", cat: "Fun & Quirks", text: "What's something that always makes you laugh, no matter what?" },
].map((q) => ({ ...q, mode: "both" }));

const ROMANTIC_QUESTIONS = [
  { id: "u1", text: "What made you fall for me?" },
  { id: "u2", text: "What's your favorite memory of us together?" },
  { id: "u3", text: "What's something small I do that makes you feel loved?" },
  { id: "u4", text: "Where do you picture us five years from now?" },
  { id: "u5", text: "What's a song that reminds you of me?" },
  { id: "u6", text: "What's something about us you never want to change?" },
].map((q) => ({ ...q, cat: THEMES.romantic.extraCategory, mode: "romantic" }));

const FRIEND_QUESTIONS = [
  { id: "fr1", text: "What do you value most about our friendship?" },
  { id: "fr2", text: "What's a memory of us that still makes you laugh?" },
  { id: "fr3", text: "What's something you appreciate about me that you don't say often?" },
  { id: "fr4", text: "What's a tradition or inside joke you hope we keep forever?" },
  { id: "fr5", text: "What's the most ridiculous thing we've ever done together?" },
  { id: "fr6", text: "If we started a business together, what would it be?" },
].map((q) => ({ ...q, cat: THEMES.friends.extraCategory, mode: "friends" }));

const QUESTIONS = [...BASE_QUESTIONS, ...ROMANTIC_QUESTIONS, ...FRIEND_QUESTIONS];
const QUESTION_MAP = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

function activeQuestions(mode) { return QUESTIONS.filter((q) => q.mode === "both" || q.mode === mode); }
function activeCategories(mode) { return [...BASE_CATEGORIES, THEMES[mode].extraCategory]; }
function getAllQuestions(mode, customQuestions = []) {
  return [...activeQuestions(mode), ...customQuestions.filter((q) => q.mode === mode)];
}
function getAllCategories(mode, customQuestions = []) {
  const cats = activeCategories(mode);
  return customQuestions.some((q) => q.mode === mode) ? [...cats, OWN_CATEGORY] : cats;
}
function getQuestionMap(customQuestions = []) {
  return { ...QUESTION_MAP, ...Object.fromEntries(customQuestions.map((q) => [q.id, q])) };
}

/* ---------------------------------------------------------
   Quotes
--------------------------------------------------------- */
const GENERAL_QUOTES = [
  "Attention is the simplest form of love — and the easiest to forget to give.",
  "You don't really know someone until you know their ordinary Tuesday.",
  "The people who ask are the people who stay.",
  "Every small question is a door left open.",
  "Closeness isn't built in big moments — it's built in the ones nobody photographs.",
  "To really know someone is to keep being surprised by them.",
  "The best conversations start with \"tell me more.\"",
  "Curiosity is one of the quietest forms of care.",
  "People change slowly. Keep asking, and you'll catch it happening.",
  "A relationship is just a long series of small check-ins.",
];
const ROMANTIC_QUOTES = [
  "Falling for someone is loud. Staying is quiet, daily, and better.",
  "Love is mostly made of ordinary Tuesdays, said yes to on purpose.",
  "The best part of loving someone is running out of new things to learn — and finding more anyway.",
  "Choose them again today. That's the whole trick.",
  "A good love story never really finishes being written.",
  "The safest place is being fully known and still wanted.",
  "Some people feel like home before you even know their middle name.",
  "Romance is grand gestures. Love is remembering how they take their coffee.",
  "The right person makes your ordinary life feel like enough.",
  "Two people paying attention is the quietest kind of magic.",
];
const FRIENDSHIP_QUOTES = [
  "A good friend remembers the story you told them once, in passing, months ago.",
  "Friendship is the relationship you choose, over and over, for no reason but that you want to.",
  "The best friendships have room for both silence and oversharing.",
  "Some friends feel like a place you can finally set your shoulders down.",
  "A real friend roots for you even when it costs them nothing to just be jealous.",
  "Inside jokes are just love with better editing.",
  "The friends who stay are the ones who keep asking the follow-up question.",
  "Good friendships age like good bread — a little effort, mostly time.",
  "You can tell a real friendship by how normal it feels to say nothing at all.",
  "A friend who still shows up ten years later was never really optional.",
];

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function dailyQuote(pool, seed) { return pool[hashStr(seed) % pool.length]; }

/* ---------------------------------------------------------
   Storage keys & helpers
--------------------------------------------------------- */
const K_ACCOUNT = "kv3-account";
const K_RELATIONSHIPS = "kv3-relationships";
const relKey = (id) => `kv3-rel:${id}`;

function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function daysBetween(a, b) { const [ay, am, ad] = a.split("-").map(Number); const [by, bm, bd] = b.split("-").map(Number); return Math.round((new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad)) / 86400000); }
function prettyDate(str) { if (!str) return ""; const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }

function pickFromPool(pool, answers, seed, excludeId, random) {
  const pool0 = pool.filter((q) => q.id !== excludeId);
  const unanswered = pool0.filter((q) => !answers[q.id]);
  const finalPool = unanswered.length ? unanswered : (pool0.length ? pool0 : pool);
  if (!finalPool.length) return pool[0]?.id;
  if (random) return finalPool[Math.floor(Math.random() * finalPool.length)].id;
  return finalPool[hashStr(seed) % finalPool.length].id;
}

const emptyRelProfile = (mode) => ({
  mode, createdAt: todayStr(), streak: 0, longestStreak: 0, lastAnsweredDate: null,
  answers: {}, todaysDate: null, todaysQuestionId: null, customQuestions: [],
});
function normalizeProfile(data, mode) {
  return { ...emptyRelProfile(mode), ...data, customQuestions: data.customQuestions || [] };
}

/* ---------------------------------------------------------
   Root component
--------------------------------------------------------- */
export default function KnowingYouApp() {
  const [stage, setStage] = useState("loading");
  const [account, setAccount] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [activeRel, setActiveRel] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [authError, setAuthError] = useState("");
  const [toast, setToast] = useState("");

  const flashToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2400); };

  useEffect(() => {
    (async () => {
      let acc = null;
      try {
        const accRes = await window.storage.get(K_ACCOUNT, false);
        if (accRes && accRes.value) acc = JSON.parse(accRes.value);
      } catch { /* no account yet */ }
      try {
        const relRes = await window.storage.get(K_RELATIONSHIPS, false);
        if (relRes && relRes.value) setRelationships(JSON.parse(relRes.value));
      } catch { /* none yet */ }
      if (acc) { setAccount(acc); setStage("login"); } else { setStage("signup"); }
    })();
  }, []);

  async function signUp(name, pin) {
    const acc = { name: name.trim(), pin, createdAt: todayStr() };
    await window.storage.set(K_ACCOUNT, JSON.stringify(acc), false);
    setAccount(acc);
    setAuthError("");
    setStage("dashboard");
  }

  function attemptLogin(pin) {
    if (account && pin === account.pin) { setAuthError(""); setStage("dashboard"); }
    else setAuthError("That passcode doesn't match. Try again.");
  }

  async function openRelationship(rel) {
    try {
      const res = await window.storage.get(relKey(rel.id), false);
      const raw = res && res.value ? JSON.parse(res.value) : {};
      const data = normalizeProfile(raw, rel.mode);
      const t = todayStr();
      const primed = (!data.todaysDate || data.todaysDate !== t)
        ? { ...data, todaysDate: t, todaysQuestionId: pickFromPool(getAllQuestions(rel.mode, data.customQuestions), data.answers, t + rel.id, null, false) }
        : data;
      setActiveProfile(primed);
      setActiveRel(rel);
      setStage("relationship");
    } catch {
      flashToast("Couldn't open that relationship");
    }
  }

  async function createRelationship(name, mode, color) {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const rel = { id, name: name.trim(), mode, color: color || AVATAR_PALETTE[relationships.length % AVATAR_PALETTE.length], answeredCount: 0, streak: 0, longestStreak: 0 };
    const nextRels = [...relationships, rel];
    setRelationships(nextRels);
    await window.storage.set(K_RELATIONSHIPS, JSON.stringify(nextRels), false);
    const fresh = emptyRelProfile(mode);
    const t = todayStr();
    fresh.todaysDate = t;
    fresh.todaysQuestionId = pickFromPool(getAllQuestions(mode, []), {}, t + id, null, false);
    await window.storage.set(relKey(id), JSON.stringify(fresh), false);
    setActiveProfile(fresh);
    setActiveRel(rel);
    setStage("relationship");
  }

  async function renameRelationship(id, name) {
    const next = relationships.map((r) => (r.id === id ? { ...r, name } : r));
    setRelationships(next);
    if (activeRel?.id === id) setActiveRel({ ...activeRel, name });
    await window.storage.set(K_RELATIONSHIPS, JSON.stringify(next), false);
  }

  async function deleteRelationship(id) {
    const next = relationships.filter((r) => r.id !== id);
    setRelationships(next);
    await window.storage.set(K_RELATIONSHIPS, JSON.stringify(next), false);
    try { await window.storage.delete(relKey(id), false); } catch { /* ignore */ }
    if (activeRel?.id === id) { setActiveRel(null); setActiveProfile(null); setStage("dashboard"); }
  }

  const persistActiveProfile = useCallback(async (next) => {
    setActiveProfile(next);
    if (!activeRel) return;
    try { await window.storage.set(relKey(activeRel.id), JSON.stringify(next), false); }
    catch { flashToast("Couldn't save — try again"); }
  }, [activeRel]);

  const updateRelSummary = useCallback(async (patch) => {
    setActiveRel((prevRel) => {
      if (!prevRel) return prevRel;
      const merged = { ...prevRel, ...patch };
      setRelationships((prevRels) => {
        const next = prevRels.map((r) => (r.id === prevRel.id ? merged : r));
        window.storage.set(K_RELATIONSHIPS, JSON.stringify(next), false).catch(() => {});
        return next;
      });
      return merged;
    });
  }, []);

  function backToDashboard() { setActiveRel(null); setActiveProfile(null); setStage("dashboard"); }

  async function eraseEverything() {
    try {
      const list = await window.storage.list("kv3-rel:", false);
      if (list && list.keys) { for (const k of list.keys) { await window.storage.delete(k, false); } }
    } catch { /* ignore */ }
    try { await window.storage.delete(K_RELATIONSHIPS, false); } catch {}
    try { await window.storage.delete(K_ACCOUNT, false); } catch {}
    setAccount(null); setRelationships([]); setActiveRel(null); setActiveProfile(null);
    setAuthError("");
    setStage("signup");
  }

  return (
    <div className="min-h-screen w-full" style={{ fontFamily: "'Public Sans', sans-serif" }}>
      <GlobalStyle />
      {stage === "loading" && <LoadingScreen />}
      {stage === "signup" && <AuthScreen mode="signup" onSubmit={signUp} />}
      {stage === "login" && (
        <AuthScreen mode="login" accountName={account?.name} error={authError} onSubmit={(_, pin) => attemptLogin(pin)} onForgot={eraseEverything} />
      )}
      {stage === "dashboard" && (
        <Dashboard
          account={account}
          relationships={relationships}
          onOpen={openRelationship}
          onCreate={createRelationship}
          onRename={renameRelationship}
          onDelete={deleteRelationship}
          onLogout={() => setStage("login")}
          onEraseAll={eraseEverything}
        />
      )}
      {stage === "relationship" && activeRel && activeProfile && (
        <RelationshipView
          rel={activeRel}
          profile={activeProfile}
          persist={persistActiveProfile}
          onBack={backToDashboard}
          onUpdateRel={updateRelSummary}
          flashToast={flashToast}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full kv-mono text-xs kv-shadow kv-pop max-w-[85%] text-center" style={{ background: NEUTRAL.ink, color: NEUTRAL.card, zIndex: 50 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
      .kv-serif { font-family: 'Fraunces', serif; }
      .kv-serif-i { font-family: 'Fraunces', serif; font-style: italic; }
      .kv-mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.06em; }
      .kv-shadow { box-shadow: 0 1px 0 rgba(0,0,0,0.03), 0 16px 32px -18px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.06); }
      .kv-shadow-lg { box-shadow: 0 2px 0 rgba(0,0,0,0.03), 0 24px 48px -20px rgba(0,0,0,0.38), 0 4px 12px rgba(0,0,0,0.08); }
      .kv-scroll::-webkit-scrollbar { width: 6px; }
      .kv-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
      textarea:focus, input:focus { outline: none; }
      button { -webkit-tap-highlight-color: transparent; }
      @keyframes kvFadeUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
      @keyframes kvPop { from { opacity:0; transform: scale(0.96); } to { opacity:1; transform: scale(1); } }
      .kv-enter { animation: kvFadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
      .kv-pop { animation: kvPop 0.35s cubic-bezier(.22,1,.36,1) both; }
      .kv-tap { transition: transform 0.12s ease, box-shadow 0.12s ease; }
      .kv-tap:active { transform: scale(0.96); }
      @media (prefers-reduced-motion: reduce) { .kv-enter, .kv-pop { animation: none; } }
    `}</style>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={pageBg(NEUTRAL)}>
      <div className="kv-mono text-xs" style={{ color: NEUTRAL.inkSoft }}>LOADING…</div>
    </div>
  );
}

/* ---------------------------------------------------------
   Segmented PIN input
--------------------------------------------------------- */
function PinInput({ value, onChange, length = 4, autoFocus, C, onEnter }) {
  const inputRef = useRef(null);
  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <div className="flex gap-2.5 justify-center">
        {Array.from({ length }).map((_, i) => {
          const filled = i < value.length;
          const active = i === value.length;
          return (
            <div key={i} className="rounded-xl flex items-center justify-center kv-shadow transition-all"
              style={{ width: 46, height: 54, background: C.card, border: `1.5px solid ${active ? C.accent : C.border}`, boxShadow: active ? `0 0 0 3px ${C.accent}22` : undefined }}>
              <div className="rounded-full transition-transform" style={{ width: 9, height: 9, background: filled ? C.accent : "transparent", transform: filled ? "scale(1)" : "scale(0)" }} />
            </div>
          );
        })}
      </div>
      <input ref={inputRef} value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()} inputMode="numeric" autoComplete="one-time-code" maxLength={length}
        autoFocus={autoFocus} style={{ position: "absolute", inset: 0, opacity: 0, fontSize: 16, cursor: "pointer" }} />
    </div>
  );
}

/* ---------------------------------------------------------
   Auth (signup / login)
--------------------------------------------------------- */
function AuthScreen({ mode, accountName, error, onSubmit, onForgot }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState(false);
  const isSignup = mode === "signup";
  const pinValid = /^\d{4}$/.test(pin);
  const canSubmit = isSignup ? !!name.trim() && pinValid && pin === confirmPin : pinValid;
  const submit = () => { if (canSubmit) onSubmit(name, pin); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={pageBg(NEUTRAL)}>
      <div className="kv-pop flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center kv-shadow-lg" style={{ background: NEUTRAL.card }}>
          {isSignup ? <UserPlus size={24} color={NEUTRAL.accent} strokeWidth={1.8} /> : <Lock size={22} color={NEUTRAL.accent} strokeWidth={1.8} />}
        </div>
        <div className="kv-serif text-3xl mt-5" style={{ color: NEUTRAL.ink }}>Knowing You</div>
        <div className="kv-mono text-[10px] uppercase mt-2 leading-relaxed" style={{ color: NEUTRAL.inkSoft }}>
          {isSignup ? "Create your space" : `Welcome back${accountName ? `, ${accountName}` : ""}`}
        </div>
      </div>

      <div className="w-full max-w-xs mt-9 kv-enter">
        {isSignup && (
          <div className="mb-5">
            <div className="kv-mono text-[10px] uppercase mb-2" style={{ color: NEUTRAL.inkSoft }}>Your name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam"
              className="w-full px-4 py-3.5 rounded-xl text-base kv-shadow" style={{ background: NEUTRAL.card, color: NEUTRAL.ink, border: `1px solid ${NEUTRAL.border}`, fontSize: 16 }} autoFocus />
          </div>
        )}
        <div className="kv-mono text-[10px] uppercase mb-2.5 text-center" style={{ color: NEUTRAL.inkSoft }}>
          {isSignup ? "Create a 4-digit passcode" : "Enter your passcode"}
        </div>
        <PinInput value={pin} onChange={setPin} C={NEUTRAL} autoFocus={!isSignup} onEnter={submit} />

        {isSignup && (
          <div className="mt-6">
            <div className="kv-mono text-[10px] uppercase mb-2.5 text-center" style={{ color: NEUTRAL.inkSoft }}>Confirm passcode</div>
            <PinInput value={confirmPin} onChange={setConfirmPin} C={NEUTRAL} onEnter={submit} />
          </div>
        )}

        {error && <div className="text-xs mt-4 text-center kv-pop" style={{ color: "#A8375A" }}>{error}</div>}
        {isSignup && pin.length === 4 && confirmPin.length === 4 && pin !== confirmPin && (
          <div className="text-xs mt-4 text-center kv-pop" style={{ color: "#A8375A" }}>Passcodes don't match yet.</div>
        )}

        <button onClick={submit} disabled={!canSubmit}
          className="w-full mt-6 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-opacity kv-tap kv-shadow"
          style={{ background: NEUTRAL.accent, color: "#fff", opacity: canSubmit ? 1 : 0.35 }}>
          {isSignup ? <><UserPlus size={15} /> Create account</> : <><LogIn size={15} /> Unlock</>}
        </button>

        {!isSignup && (
          <div className="text-center mt-4">
            {!forgotConfirm ? (
              <button onClick={() => setForgotConfirm(true)} className="kv-mono text-[9px] uppercase" style={{ color: "#B8AF97" }}>Forgot your passcode?</button>
            ) : (
              <div className="kv-mono text-[9px] uppercase leading-relaxed" style={{ color: "#A8375A" }}>
                This erases everything on this device — no way to recover it otherwise.
                <br />
                <button onClick={onForgot} className="underline mr-2 mt-1 inline-block">Erase & start over</button>
                <button onClick={() => setForgotConfirm(false)} className="underline mt-1 inline-block" style={{ color: "#B8AF97" }}>Cancel</button>
              </div>
            )}
          </div>
        )}
        <div className="kv-mono text-[9px] uppercase text-center mt-5 leading-relaxed" style={{ color: "#B8AF97" }}>
          A private passcode stored on this device — not a server account.
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Dashboard
--------------------------------------------------------- */
function Dashboard({ account, relationships, onOpen, onCreate, onRename, onDelete, onLogout, onEraseAll }) {
  const [creating, setCreating] = useState(false);
  const [managing, setManaging] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);
  const quote = useMemo(() => dailyQuote(GENERAL_QUOTES, todayStr()), []);

  return (
    <div className="min-h-screen w-full" style={pageBg(NEUTRAL)}>
      <div className="max-w-md mx-auto px-5 pt-8 pb-16">
        <div className="flex items-center justify-between mb-6 kv-enter">
          <div>
            <div className="kv-mono text-[10px] uppercase" style={{ color: NEUTRAL.inkSoft }}>Welcome back</div>
            <div className="kv-serif text-2xl mt-0.5" style={{ color: NEUTRAL.ink }}>{account?.name || "there"}</div>
          </div>
          <div className="flex items-center gap-2">
            {relationships.length > 0 && (
              <button onClick={() => setManaging(true)} className="w-9 h-9 rounded-full flex items-center justify-center kv-shadow kv-tap" style={{ background: NEUTRAL.card, color: NEUTRAL.inkSoft }} title="Manage relationships">
                <Settings2 size={14} />
              </button>
            )}
            <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full kv-shadow kv-tap" style={{ background: NEUTRAL.card, color: NEUTRAL.inkSoft }}>
              <LogOut size={13} /> <span className="kv-mono text-[10px] uppercase">Log out</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl p-4 mb-7 kv-enter kv-shadow flex gap-3 relative overflow-hidden" style={{ background: NEUTRAL.card, border: `1px solid ${NEUTRAL.border}` }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: `${NEUTRAL.accent}14` }} />
          <Quote size={16} color={NEUTRAL.accent} className="shrink-0 mt-0.5" style={{ position: "relative" }} />
          <div className="kv-serif-i text-sm leading-relaxed" style={{ color: NEUTRAL.ink, position: "relative" }}>{quote}</div>
        </div>

        <div className="flex items-center justify-between mb-3 kv-enter">
          <div className="kv-mono text-[10px] uppercase" style={{ color: NEUTRAL.inkSoft }}>Your relationships · {relationships.length}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 kv-enter">
          {relationships.map((rel) => <RelCard key={rel.id} rel={rel} onOpen={() => onOpen(rel)} />)}
          <button onClick={() => setCreating(true)} className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[136px] transition-all kv-tap"
            style={{ background: "rgba(255,255,255,0.45)", border: `1.5px dashed ${NEUTRAL.border}` }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: NEUTRAL.accentSoft }}>
              <Plus size={16} color={NEUTRAL.accent} />
            </div>
            <span className="text-xs font-medium" style={{ color: NEUTRAL.inkSoft }}>New relationship</span>
          </button>
        </div>

        {relationships.length === 0 && (
          <div className="text-xs mt-4 text-center kv-enter" style={{ color: NEUTRAL.inkSoft }}>
            Add your first person to start collecting daily answers about them.
          </div>
        )}

        <div className="mt-12 text-center">
          {!confirmErase ? (
            <button onClick={() => setConfirmErase(true)} className="kv-mono text-[10px] uppercase inline-flex items-center gap-1" style={{ color: "#B8AF97" }}>
              <RotateCcw size={11} /> Erase all data
            </button>
          ) : (
            <div className="kv-mono text-[10px] uppercase" style={{ color: "#A8375A" }}>
              Erase account & every relationship?{" "}
              <button onClick={onEraseAll} className="underline">Yes, erase</button> ·{" "}
              <button onClick={() => setConfirmErase(false)} className="underline">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {creating && <NewRelationshipModal onClose={() => setCreating(false)} onCreate={(n, m, c) => { setCreating(false); onCreate(n, m, c); }} />}
      {managing && <ManageModal relationships={relationships} onRename={onRename} onDelete={onDelete} onClose={() => setManaging(false)} />}
    </div>
  );
}

function RelCard({ rel, onOpen }) {
  const theme = THEMES[rel.mode];
  const C = theme.colors;
  const color = rel.color || C.accent;
  const initial = (rel.name || "?").trim()[0]?.toUpperCase() || "?";
  const pct = Math.min(100, Math.round(((rel.answeredCount || 0) / TOTAL_QUESTIONS_PER_MODE) * 100));

  return (
    <button onClick={onOpen} className="rounded-2xl p-4 text-left kv-shadow transition-all kv-tap" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="relative" style={{ width: 44, height: 44 }}>
          <div className="rounded-full" style={{ width: 44, height: 44, background: `conic-gradient(${color} ${pct}%, ${C.tabBg} ${pct}% 100%)` }} />
          <div className="absolute rounded-full flex items-center justify-center text-sm font-semibold" style={{ inset: 3, background: C.card, color }}>{initial}</div>
        </div>
        {rel.streak > 0 && (
          <div className="flex items-center gap-1">
            <Flame size={12} color={C.flame} fill={C.flame} />
            <span className="kv-mono text-[10px]" style={{ color: C.inkSoft }}>{rel.streak}</span>
          </div>
        )}
      </div>
      <div className="text-sm font-medium truncate" style={{ color: C.ink }}>{rel.name}</div>
      <div className="flex items-center gap-1.5 mt-1">
        <theme.icon size={10} color={C.accent} fill={rel.mode === "romantic" ? C.accent : "none"} />
        <span className="kv-mono text-[9px] uppercase" style={{ color: C.inkSoft }}>{theme.label} · {pct}%</span>
      </div>
    </button>
  );
}

function NewRelationshipModal({ onClose, onCreate }) {
  const [mode, setMode] = useState("friends");
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_PALETTE[0]);
  const theme = THEMES[mode];
  const C = theme.colors;
  const submit = () => name.trim() && onCreate(name, mode, color);
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-40" style={{ background: "rgba(20,18,15,0.45)" }} onClick={onClose}>
      <div className="w-full max-w-xs rounded-t-3xl sm:rounded-3xl p-6 kv-pop kv-shadow-lg max-h-[90vh] overflow-y-auto kv-scroll" style={{ background: C.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="kv-serif text-lg" style={{ color: C.ink }}>New relationship</div>
          <button onClick={onClose} className="kv-tap"><X size={16} color={C.inkSoft} /></button>
        </div>

        <div className="kv-mono text-[10px] uppercase mb-2" style={{ color: C.inkSoft }}>Who's this for?</div>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {Object.entries(THEMES).map(([key, t]) => {
            const active = mode === key;
            return (
              <button key={key} onClick={() => setMode(key)} className="rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all kv-tap"
                style={{ background: active ? t.colors.card : "rgba(0,0,0,0.02)", border: `1.5px solid ${active ? t.colors.accent : t.colors.border}` }}>
                <t.icon size={16} color={t.colors.accent} fill={key === "romantic" && active ? t.colors.accent : "none"} strokeWidth={1.8} />
                <span className="text-xs font-medium" style={{ color: t.colors.ink }}>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="kv-mono text-[10px] uppercase mb-2" style={{ color: C.inkSoft }}>Their name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name" onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full px-4 py-3.5 rounded-xl text-base mb-5" style={{ background: "#fff", color: C.ink, border: `1px solid ${C.border}`, fontSize: 16 }} autoFocus />

        <div className="kv-mono text-[10px] uppercase mb-2" style={{ color: C.inkSoft }}>Avatar color</div>
        <div className="flex gap-2.5 mb-6">
          {AVATAR_PALETTE.map((c) => (
            <button key={c} onClick={() => setColor(c)} className="rounded-full kv-tap flex items-center justify-center"
              style={{ width: 30, height: 30, background: c, border: color === c ? `2.5px solid ${C.ink}` : "2.5px solid transparent", boxShadow: color === c ? `0 0 0 2px ${C.card}` : undefined }}>
              {color === c && <Check size={13} color="#fff" strokeWidth={3} />}
            </button>
          ))}
        </div>

        <button onClick={submit} disabled={!name.trim()} className="w-full py-3.5 rounded-xl font-medium text-sm transition-opacity kv-tap" style={{ background: C.accent, color: "#fff", opacity: name.trim() ? 1 : 0.4 }}>
          Start collecting
        </button>
      </div>
    </div>
  );
}

function ManageModal({ relationships, onRename, onDelete, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-40" style={{ background: "rgba(20,18,15,0.45)" }} onClick={onClose}>
      <div className="w-full max-w-xs rounded-t-3xl sm:rounded-3xl p-6 kv-pop kv-shadow-lg max-h-[80vh] overflow-y-auto kv-scroll" style={{ background: NEUTRAL.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="kv-serif text-lg" style={{ color: NEUTRAL.ink }}>Manage relationships</div>
          <button onClick={onClose} className="kv-tap"><X size={16} color={NEUTRAL.inkSoft} /></button>
        </div>
        <div className="space-y-2">
          {relationships.map((rel) => {
            const theme = THEMES[rel.mode];
            const isEditing = editingId === rel.id;
            const isConfirming = confirmId === rel.id;
            return (
              <div key={rel.id} className="rounded-xl p-3" style={{ background: NEUTRAL.pillBg, border: `1px solid ${NEUTRAL.border}` }}>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
                      className="flex-1 px-2.5 py-2 rounded-lg text-sm" style={{ background: "#fff", border: `1px solid ${NEUTRAL.border}`, color: NEUTRAL.ink, fontSize: 16 }} />
                    <button onClick={() => { if (draft.trim()) onRename(rel.id, draft.trim()); setEditingId(null); }} className="kv-tap"><Check size={16} color={theme.colors.accent} /></button>
                    <button onClick={() => setEditingId(null)} className="kv-tap"><X size={16} color={NEUTRAL.inkSoft} /></button>
                  </div>
                ) : isConfirming ? (
                  <div className="kv-mono text-[10px] uppercase leading-relaxed" style={{ color: "#A8375A" }}>
                    Delete {rel.name} and every saved answer?
                    <div className="mt-1.5">
                      <button onClick={() => onDelete(rel.id)} className="underline mr-3">Yes, delete</button>
                      <button onClick={() => setConfirmId(null)} className="underline" style={{ color: NEUTRAL.inkSoft }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: rel.color || theme.colors.accent, color: "#fff" }}>
                        {(rel.name || "?")[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium truncate" style={{ color: NEUTRAL.ink }}>{rel.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button onClick={() => { setEditingId(rel.id); setDraft(rel.name); }} className="kv-tap"><Pencil size={13} color={NEUTRAL.inkSoft} /></button>
                      <button onClick={() => setConfirmId(rel.id)} className="kv-tap"><Trash2 size={13} color="#A8375A" /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Relationship view
--------------------------------------------------------- */
function RelationshipView({ rel, profile, persist, onBack, onUpdateRel, flashToast }) {
  const [view, setView] = useState("today");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [memoryNonce, setMemoryNonce] = useState(0);
  const [addingQuestion, setAddingQuestion] = useState(false);

  const theme = THEMES[rel.mode];
  const C = theme.colors;
  const qMap = useMemo(() => getQuestionMap(profile.customQuestions), [profile.customQuestions]);
  const pool = useMemo(() => getAllQuestions(rel.mode, profile.customQuestions), [rel.mode, profile.customQuestions]);
  const answeredToday = profile.answers[profile.todaysQuestionId];
  const todaysQ = qMap[profile.todaysQuestionId];
  const streakAtRisk = !answeredToday && profile.lastAnsweredDate === yesterdayStr();
  const quote = useMemo(() => dailyQuote(rel.mode === "romantic" ? ROMANTIC_QUOTES : FRIENDSHIP_QUOTES, todayStr() + rel.id), [rel.id, rel.mode]);

  useEffect(() => {
    if (answeredToday && !editing) setDraftAnswer(answeredToday.answer);
    else if (!answeredToday) setDraftAnswer("");
  }, [profile.todaysQuestionId]); // eslint-disable-line

  useEffect(() => {
    document.title = !answeredToday ? (streakAtRisk ? "🔥 Streak at risk — Knowing You" : "● Today's question waiting") : "Knowing You";
  }, [profile.todaysQuestionId, answeredToday, streakAtRisk]);

  async function switchMode(mode) {
    if (mode === rel.mode) return;
    const t = todayStr();
    await onUpdateRel({ mode });
    await persist({ ...profile, mode, todaysDate: t, todaysQuestionId: pickFromPool(getAllQuestions(mode, profile.customQuestions), profile.answers, t + rel.id + mode, null, false) });
    setEditing(false); setExpanded(null);
  }

  async function shuffleQuestion() {
    const qid = pickFromPool(pool, profile.answers, "", profile.todaysQuestionId, true);
    await persist({ ...profile, todaysQuestionId: qid, todaysDate: todayStr() });
    setDraftAnswer(""); setEditing(false);
  }

  async function saveAnswer() {
    if (!draftAnswer.trim()) return;
    const t = todayStr(); const y = yesterdayStr();
    const prevTotal = Object.keys(profile.answers).length;
    let streak = profile.streak;
    if (profile.lastAnsweredDate === t) { /* editing today */ }
    else if (profile.lastAnsweredDate === y) streak = profile.streak + 1;
    else streak = 1;
    const longestStreak = Math.max(profile.longestStreak || 0, streak);
    const isNew = !profile.answers[profile.todaysQuestionId];
    const next = {
      ...profile, streak, longestStreak, lastAnsweredDate: t,
      answers: { ...profile.answers, [profile.todaysQuestionId]: { answer: draftAnswer.trim(), date: t, edited: !isNew, favorite: profile.answers[profile.todaysQuestionId]?.favorite || false } },
    };
    const newTotal = Object.keys(next.answers).length;
    await persist(next);
    await onUpdateRel({ answeredCount: newTotal, streak, longestStreak });
    setEditing(false);

    const hitStreak = STREAK_MILESTONES.find((m) => profile.streak < m && streak >= m);
    const hitAnswers = ANSWER_MILESTONES.find((m) => prevTotal < m && newTotal >= m);
    if (hitStreak) flashToast(`🔥 ${hitStreak}-day streak with ${rel.name}!`);
    else if (hitAnswers) flashToast(`🎉 ${hitAnswers} questions filed for ${rel.name}!`);
    else flashToast("Saved to the collection");
  }

  async function saveEditFromCollection(qid, text) {
    if (!text.trim()) return;
    await persist({ ...profile, answers: { ...profile.answers, [qid]: { ...profile.answers[qid], answer: text.trim(), edited: true } } });
  }
  async function toggleFavorite(qid) {
    const entry = profile.answers[qid]; if (!entry) return;
    await persist({ ...profile, answers: { ...profile.answers, [qid]: { ...entry, favorite: !entry.favorite } } });
  }
  async function addCustomQuestion(text) {
    if (!text.trim()) return;
    const q = { id: `custom-${Date.now()}`, text: text.trim(), cat: OWN_CATEGORY, mode: rel.mode };
    await persist({ ...profile, customQuestions: [...profile.customQuestions, q] });
    setAddingQuestion(false);
    flashToast("Added to your question bank");
  }
  async function resetRelationship() {
    const fresh = emptyRelProfile(rel.mode);
    const t = todayStr();
    fresh.todaysDate = t;
    fresh.todaysQuestionId = pickFromPool(getAllQuestions(rel.mode, []), {}, t + rel.id, null, false);
    await persist(fresh);
    await onUpdateRel({ answeredCount: 0, streak: 0, longestStreak: fresh.longestStreak });
    setConfirmReset(false); setView("today");
  }

  async function copyCollection() {
    const cats = getAllCategories(rel.mode, profile.customQuestions);
    const lines = [`${rel.name} — ${theme.label} collection`, ""];
    let any = false;
    cats.forEach((cat) => {
      const qs = pool.filter((q) => q.cat === cat && profile.answers[q.id]);
      if (!qs.length) return;
      any = true;
      lines.push(`${cat}`, "");
      qs.forEach((q) => { lines.push(`Q: ${q.text}`, `A: ${profile.answers[q.id].answer}`, ""); });
    });
    if (!any) { flashToast("Nothing filed yet to copy"); return; }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      flashToast("Copied — paste it anywhere to save or share");
    } catch {
      flashToast("Couldn't copy — try again");
    }
  }

  const totalAnswered = Object.keys(profile.answers).length;
  const totalActive = pool.length;
  const daysKnown = Math.max(1, daysBetween(profile.createdAt, todayStr()) + 1);
  const catStats = getAllCategories(rel.mode, profile.customQuestions).map((cat) => {
    const qs = pool.filter((q) => q.cat === cat);
    const done = qs.filter((q) => profile.answers[q.id]).length;
    return { cat, qs, done, total: qs.length };
  });

  const answeredIds = Object.keys(profile.answers).filter((id) => id !== profile.todaysQuestionId);
  const memory = answeredIds.length
    ? (() => { const id = answeredIds[hashStr(todayStr() + rel.id + "mem" + memoryNonce) % answeredIds.length]; return { q: qMap[id], entry: profile.answers[id] }; })()
    : null;

  return (
    <div className="min-h-screen w-full transition-colors duration-500" style={pageBg(C)}>
      <div className="max-w-md mx-auto px-5 pt-6 pb-16">
        <button onClick={onBack} className="flex items-center gap-1.5 mb-4 kv-mono text-[10px] uppercase kv-enter kv-tap" style={{ color: C.inkSoft }}>
          <ArrowLeft size={13} /> Dashboard
        </button>

        <div className="flex items-center justify-between mb-4 kv-enter">
          <div>
            <div className="kv-mono text-[10px] uppercase" style={{ color: C.inkSoft }}>{theme.eyebrow}</div>
            <div className="kv-serif text-2xl mt-0.5 flex items-center gap-2" style={{ color: C.ink }}>
              {rel.name}
              <theme.icon size={16} color={C.accent} fill={rel.mode === "romantic" ? C.accent : "none"} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full kv-shadow" style={{ background: C.card }} title={streakAtRisk ? "Answer today to keep your streak" : "Current streak"}>
            <Flame size={15} color={profile.streak > 0 ? (streakAtRisk ? "#C9784B" : C.flame) : "#C7BFA8"} fill={profile.streak > 0 ? (streakAtRisk ? "#C9784B" : C.flame) : "none"} strokeWidth={2} />
            <span className="kv-mono text-xs" style={{ color: C.ink }}>{profile.streak}</span>
          </div>
        </div>

        <div className="flex gap-1 mb-3 p-1 rounded-full kv-enter" style={{ background: C.tabBg }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => switchMode(key)} className="flex-1 py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
              style={{ background: rel.mode === key ? C.card : "transparent", color: rel.mode === key ? C.ink : C.inkSoft }}>
              <t.icon size={12} strokeWidth={2} /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 mb-4 p-1 rounded-full kv-enter" style={{ background: C.tabBg }}>
          {["today", "collection"].map((v) => (
            <button key={v} onClick={() => setView(v)} className="flex-1 py-2 rounded-full text-sm font-medium transition-colors"
              style={{ background: view === v ? C.card : "transparent", color: view === v ? C.ink : C.inkSoft }}>
              {v === "today" ? "Today" : `Collection · ${totalAnswered}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 kv-enter">
          <StatPill icon={TrendingUp} label="Best streak" value={profile.longestStreak || 0} C={C} />
          <StatPill icon={CalendarDays} label="Days known" value={daysKnown} C={C} />
          <StatPill icon={Sparkles} label="Filed" value={`${totalAnswered}/${totalActive}`} C={C} />
        </div>

        {view === "today" && todaysQ && (
          <div className="kv-enter">
            <QuoteStrip quote={quote} C={C} />
            {!answeredToday && <NudgeBanner theme={theme} atRisk={streakAtRisk} isFirstDay={profile.streak === 0 && totalAnswered === 0} />}
            <TodayCard key={todaysQ.id} theme={theme} q={todaysQ} answered={answeredToday}
              editing={editing} setEditing={setEditing} draftAnswer={draftAnswer} setDraftAnswer={setDraftAnswer}
              onShuffle={shuffleQuestion} onSave={saveAnswer} />
            {memory && (
              <MemoryLane theme={theme} q={memory.q} entry={memory.entry} onShuffle={() => setMemoryNonce((n) => n + 1)} />
            )}
          </div>
        )}

        {view === "collection" && (
          <div className="kv-enter">
            <Collection theme={theme} totalAnswered={totalAnswered} totalActive={totalActive} catStats={catStats}
              expanded={expanded} setExpanded={setExpanded} answers={profile.answers}
              onSaveEdit={saveEditFromCollection} onToggleFavorite={toggleFavorite}
              onCopyAll={copyCollection} onAddQuestion={() => setAddingQuestion(true)} />
          </div>
        )}

        <div className="mt-10 text-center">
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="kv-mono text-[10px] uppercase inline-flex items-center gap-1" style={{ color: "#B8AF97" }}>
              <RotateCcw size={11} /> Reset this relationship
            </button>
          ) : (
            <div className="kv-mono text-[10px] uppercase" style={{ color: C.accent }}>
              Erase all answers for {rel.name}?{" "}
              <button onClick={resetRelationship} className="underline">Yes, erase</button> ·{" "}
              <button onClick={() => setConfirmReset(false)} className="underline">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {addingQuestion && <AddQuestionModal theme={theme} onClose={() => setAddingQuestion(false)} onAdd={addCustomQuestion} />}
    </div>
  );
}

function StatPill({ icon: Icon, label, value, C }) {
  return (
    <div className="rounded-xl px-2.5 py-2.5 flex flex-col items-center gap-1 kv-shadow" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <Icon size={13} color={C.accent} strokeWidth={2} />
      <div className="text-sm font-semibold" style={{ color: C.ink }}>{value}</div>
      <div className="kv-mono text-[8px] uppercase text-center leading-tight" style={{ color: C.inkSoft }}>{label}</div>
    </div>
  );
}

function QuoteStrip({ quote, C }) {
  return (
    <div className="flex items-start gap-2 mb-3 px-3.5 py-2.5 rounded-xl" style={{ background: C.pillBg, border: `1px solid ${C.border}` }}>
      <Quote size={13} color={C.accent} className="shrink-0 mt-0.5" />
      <span className="kv-serif-i text-xs leading-snug" style={{ color: C.inkSoft }}>{quote}</span>
    </div>
  );
}

function NudgeBanner({ theme, atRisk, isFirstDay }) {
  const C = theme.colors;
  let text = "Today's question is still waiting for an answer.";
  if (isFirstDay) text = "Your first question is here — takes about two minutes.";
  else if (atRisk) text = "Answer today to keep your streak alive — it resets at midnight.";
  return (
    <div className="flex items-center gap-2.5 mb-3 px-3.5 py-2.5 rounded-xl kv-pop" style={{ background: atRisk ? "#FBEADD" : C.pillBg, border: `1px solid ${atRisk ? "#E9C79A" : C.border}` }}>
      {atRisk ? <Bell size={14} color="#B5722F" strokeWidth={2} /> : <Sparkles size={14} color={C.accent} strokeWidth={2} />}
      <span className="text-xs leading-snug" style={{ color: atRisk ? "#7A5323" : C.inkSoft }}>{text}</span>
    </div>
  );
}

function TodayCard({ theme, q, answered, editing, setEditing, draftAnswer, setDraftAnswer, onShuffle, onSave }) {
  const C = theme.colors;
  const showForm = !answered || editing;
  return (
    <div className="kv-pop" style={{ transform: "rotate(-0.4deg)", position: "relative" }}>
      <div style={{ position: "absolute", inset: "-7px", border: `1.5px solid ${C.border}`, borderRadius: 16, pointerEvents: "none" }} />
      <div className="rounded-2xl p-6 kv-shadow-lg relative overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", background: `${C.accent}12` }} />
        <div className="flex items-center justify-between mb-4 relative">
          <span className="kv-mono text-[10px] uppercase px-2.5 py-1 rounded-full" style={{ background: C.accentSoft, color: C.accent }}>{q.cat}</span>
          {!showForm && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 kv-mono text-[10px] uppercase kv-tap" style={{ color: C.inkSoft }}>
              <Pencil size={11} /> Edit
            </button>
          )}
        </div>
        <div className="kv-serif text-xl leading-snug mb-5 relative" style={{ color: C.ink }}>{q.text}</div>
        {showForm ? (
          <>
            <textarea value={draftAnswer} onChange={(e) => setDraftAnswer(e.target.value)} placeholder="Write what comes to mind…" rows={5}
              className="w-full p-3 rounded-lg text-sm resize-none kv-scroll relative" style={{ background: C.pillBg, color: C.ink, border: `1px solid ${C.border}`, fontSize: 16 }} autoFocus={editing} />
            <div className="flex items-center justify-between mt-4 relative">
              <button onClick={onShuffle} className="flex items-center gap-1.5 kv-mono text-[10px] uppercase kv-tap" style={{ color: C.inkSoft }}>
                <Shuffle size={13} /> Different question
              </button>
              <button onClick={onSave} disabled={!draftAnswer.trim()} className="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-opacity kv-tap"
                style={{ background: C.accent, color: C.card, opacity: draftAnswer.trim() ? 1 : 0.4 }}>
                <Check size={14} /> Save
              </button>
            </div>
          </>
        ) : (
          <div className="relative">
            <div className="text-sm leading-relaxed" style={{ color: C.ink }}>{answered.answer}</div>
            <div className="kv-mono text-[10px] uppercase mt-4" style={{ color: "#B8AF97" }}>Filed away today{answered.edited ? " · edited" : ""}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryLane({ theme, q, entry, onShuffle }) {
  const C = theme.colors;
  if (!q) return null;
  return (
    <div className="mt-4 rounded-2xl p-4 kv-shadow" style={{ background: C.pillBg, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 kv-mono text-[10px] uppercase" style={{ color: C.accent }}>
          <Clock size={12} /> Look back
        </div>
        <button onClick={onShuffle} className="kv-tap"><Shuffle size={12} color={C.inkSoft} /></button>
      </div>
      <div className="text-xs font-medium mb-1.5" style={{ color: C.inkSoft }}>{q.text}</div>
      <div className="text-sm leading-relaxed" style={{ color: C.ink }}>{entry.answer}</div>
      <div className="kv-mono text-[9px] uppercase mt-2" style={{ color: "#B8AF97" }}>Answered {prettyDate(entry.date)}</div>
    </div>
  );
}

function Collection({ theme, totalAnswered, totalActive, catStats, expanded, setExpanded, answers, onSaveEdit, onToggleFavorite, onCopyAll, onAddQuestion }) {
  const C = theme.colors;
  const favorites = Object.entries(answers).filter(([, v]) => v.favorite);
  const qLookup = {};
  catStats.forEach(({ qs }) => qs.forEach((q) => { qLookup[q.id] = q; }));
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="kv-mono text-[10px] uppercase" style={{ color: C.inkSoft }}>{totalAnswered} of {totalActive} questions filed</div>
        {totalAnswered > 0 && (
          <button onClick={onCopyAll} className="flex items-center gap-1 kv-mono text-[9px] uppercase kv-tap" style={{ color: C.accent }}>
            <Copy size={11} /> Copy all
          </button>
        )}
      </div>

      {favorites.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 kv-mono text-[10px] uppercase mb-2" style={{ color: C.accent }}>
            <Star size={11} fill={C.accent} /> Favorites
          </div>
          <div className="space-y-2.5">
            {favorites.map(([qid, entry]) => (
              qLookup[qid] && (
                <CollectionCard key={qid} theme={theme} q={qLookup[qid]} entry={entry} onSave={(t) => onSaveEdit(qid, t)} onToggleFavorite={() => onToggleFavorite(qid)} />
              )
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {catStats.map(({ cat, qs, done, total }) => {
          const isOpen = expanded === cat;
          return (
            <div key={cat} className="rounded-xl overflow-hidden kv-shadow" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <button onClick={() => setExpanded(isOpen ? null : cat)} className="w-full flex items-center justify-between px-4 py-3.5">
                <div className="text-left">
                  <div className="text-sm font-medium" style={{ color: C.ink }}>{cat}</div>
                  <div className="kv-mono text-[10px] mt-0.5" style={{ color: "#B8AF97" }}>{done} / {total}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-1.5 rounded-full overflow-hidden" style={{ background: C.tabBg }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%`, background: C.accent }} />
                  </div>
                  <ChevronDown size={15} color={C.inkSoft} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2.5">
                  {qs.map((q) => (
                    <CollectionCard key={q.id} theme={theme} q={q} entry={answers[q.id]} onSave={(text) => onSaveEdit(q.id, text)} onToggleFavorite={() => onToggleFavorite(q.id)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={onAddQuestion} className="w-full mt-4 flex items-center justify-center gap-1.5 py-3 rounded-xl kv-tap" style={{ background: C.pillBg, border: `1px dashed ${C.border}`, color: C.accent }}>
        <PlusCircle size={14} /> <span className="text-xs font-medium">Add your own question</span>
      </button>
    </div>
  );
}

function CollectionCard({ theme, q, entry, onSave, onToggleFavorite }) {
  const C = theme.colors;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry?.answer || "");

  if (!entry) {
    return (
      <div className="rounded-lg p-3" style={{ background: C.pillBg }}>
        <div className="text-xs" style={{ color: C.inkSoft }}>{q.text}</div>
        <div className="kv-mono text-[9px] uppercase mt-1.5" style={{ color: "#C7BFA8" }}>Not yet answered</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-3" style={{ background: C.pillBg }}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium" style={{ color: C.ink }}>{q.text}</div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <button onClick={onToggleFavorite} className="kv-tap">
            <Star size={12} color={entry.favorite ? C.accent : C.inkSoft} fill={entry.favorite ? C.accent : "none"} />
          </button>
          {!editing && (
            <button onClick={() => setEditing(true)} className="kv-tap">
              <Pencil size={11} color={C.inkSoft} />
            </button>
          )}
        </div>
      </div>
      {editing ? (
        <div className="mt-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full p-2 rounded text-xs resize-none"
            style={{ background: C.card, color: C.ink, border: `1px solid ${C.border}`, fontSize: 16 }} autoFocus />
          <div className="flex justify-end gap-2 mt-1.5">
            <button onClick={() => { setText(entry.answer); setEditing(false); }} className="kv-mono text-[9px] uppercase flex items-center gap-0.5" style={{ color: C.inkSoft }}>
              <X size={10} /> Cancel
            </button>
            <button onClick={() => { onSave(text); setEditing(false); }} className="kv-mono text-[9px] uppercase flex items-center gap-0.5" style={{ color: C.accent }}>
              <Check size={10} /> Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs leading-relaxed mt-1.5" style={{ color: C.ink }}>{entry.answer}</div>
          <div className="kv-mono text-[9px] uppercase mt-1.5" style={{ color: "#C7BFA8" }}>{prettyDate(entry.date)}{entry.edited ? " · edited" : ""}</div>
        </>
      )}
    </div>
  );
}

function AddQuestionModal({ theme, onClose, onAdd }) {
  const [text, setText] = useState("");
  const C = theme.colors;
  const submit = () => text.trim() && onAdd(text);
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-40" style={{ background: "rgba(20,18,15,0.45)" }} onClick={onClose}>
      <div className="w-full max-w-xs rounded-t-3xl sm:rounded-3xl p-6 kv-pop kv-shadow-lg" style={{ background: C.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="kv-serif text-lg" style={{ color: C.ink }}>Add your own question</div>
          <button onClick={onClose} className="kv-tap"><X size={16} color={C.inkSoft} /></button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. What's something you wish I asked you more?" rows={3}
          className="w-full p-3 rounded-xl text-sm resize-none" style={{ background: C.pillBg, color: C.ink, border: `1px solid ${C.border}`, fontSize: 16 }} autoFocus />
        <div className="kv-mono text-[9px] uppercase mt-2 leading-relaxed" style={{ color: C.inkSoft }}>
          It'll join the daily rotation under "{OWN_CATEGORY}."
        </div>
        <button onClick={submit} disabled={!text.trim()} className="w-full mt-4 py-3.5 rounded-xl font-medium text-sm transition-opacity kv-tap" style={{ background: C.accent, color: "#fff", opacity: text.trim() ? 1 : 0.4 }}>
          Add question
        </button>
      </div>
    </div>
  );
}
