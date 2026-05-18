const horrorByTheme = {
  ghost: [
    "মধ্যরাতে দরজা নিজে নিজে খুলে গেল, আর করিডরে ভেজা পায়ের ছাপ দেখা গেল।",
    "হঠাৎ আয়নায় তোমার পেছনে সাদা শাড়ি পরা কেউ দাঁড়িয়ে ছিল।",
    "তোমার নাম ধরে যে ডেকেছিল, সে এই বাড়ির কেউ নয়।"
  ],
  "dark-room": [
    "অন্ধকার ঘরের কোণ থেকে ফিসফিস করে কেউ বলল, ‘লাইট জ্বালিও না…’।",
    "দেয়ালে ঝোলানো ছবির চোখ তোমার দিকে ধীরে ধীরে ঘুরে গেল।",
    "ঘড়ির কাঁটা ৩:৩৩-এ থেমে আছে, কিন্তু টিকটিক শব্দ থামছে না।"
  ],
  forest: [
    "জঙ্গলের ভেতর যে পথটা তুমি দেখছ, সেটা কোনো মানচিত্রে নেই।",
    "গাছের ডাল থেকে ঝুলছে নাম-না-জানা মুখোশ, সবগুলো তোমার দিকে তাকিয়ে আছে।",
    "পেছনে পায়ের শব্দ শুনছ, কিন্তু তোমার ছাড়া আর কেউ নেই।"
  ],
  cemetery: [
    "কবরস্থানের গেট বন্ধ, তবুও ভেতর থেকে কারা যেন বের হওয়ার চেষ্টা করছে।",
    "পুরনো কবরের ওপর তোমার নিজের নাম লেখা একটি নতুন পাথর পাওয়া গেল।",
    "হাওয়া নেই, তবু সব কবরের মাটি একসাথে কাঁপছে।"
  ]
};

const themeEl = document.getElementById("theme");
const customTextEl = document.getElementById("customText");
const resultEl = document.getElementById("result");
const generateBtn = document.getElementById("generateBtn");
const speakBtn = document.getElementById("speakBtn");

function generateHorrorText() {
  const theme = themeEl.value;
  const texts = horrorByTheme[theme] || horrorByTheme.ghost;
  const pick = texts[Math.floor(Math.random() * texts.length)];
  resultEl.textContent = pick;
}

function pickBestVoice(voices) {
  const exactBnBd = voices.find((voice) => voice.lang.toLowerCase() === "bn-bd");
  if (exactBnBd) return exactBnBd;

  const anyBangla = voices.find((voice) => voice.lang.toLowerCase().startsWith("bn"));
  if (anyBangla) return anyBangla;

  return null;
}

function speakWithBrowserTTS(text) {
  if (!("speechSynthesis" in window)) {
    alert("আপনার ব্রাউজারে Speech Synthesis সাপোর্ট নেই। Chrome/Edge ব্যবহার করে দেখুন।");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 0.8;

  const voices = window.speechSynthesis.getVoices();
  const chosen = pickBestVoice(voices);
  if (chosen) {
    utterance.voice = chosen;
    utterance.lang = chosen.lang;
  } else {
    utterance.lang = "bn-BD";
  }

  utterance.onend = () => {
    speakBtn.disabled = false;
    speakBtn.textContent = "🔊 ভয়েস প্লে";
  };

  utterance.onerror = () => {
    speakBtn.disabled = false;
    speakBtn.textContent = "🔊 ভয়েস প্লে";
    alert("ভয়েস প্লে করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
  };

  window.speechSynthesis.speak(utterance);
}

generateBtn.addEventListener("click", generateHorrorText);

speakBtn.addEventListener("click", () => {
  const text = customTextEl.value.trim() || resultEl.textContent.trim();
  if (!text || text === "এখানে ভয়ংকর টেক্সট দেখাবে...") {
    alert("আগে টেক্সট লিখুন বা জেনারেট করুন");
    return;
  }

  speakBtn.disabled = true;
  speakBtn.textContent = "প্লে হচ্ছে...";
  speakWithBrowserTTS(text);
});

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
