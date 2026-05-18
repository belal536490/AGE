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

const apiKeyEl = document.getElementById("apiKey");
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

async function speakWithGoogleTTS(text) {
  const apiKey = apiKeyEl.value.trim();
  if (!apiKey) {
    alert("Google API Key দিন");
    return;
  }

  const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const body = {
    input: { text },
    voice: {
      languageCode: "bn-BD",
      name: "bn-BD-Standard-A"
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 0.9,
      pitch: -2.0
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TTS failed: ${errText}`);
  }

  const data = await res.json();
  const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
  audio.play();
}

generateBtn.addEventListener("click", generateHorrorText);

speakBtn.addEventListener("click", async () => {
  const text = customTextEl.value.trim() || resultEl.textContent.trim();
  if (!text || text === "এখানে ভয়ংকর টেক্সট দেখাবে...") {
    alert("আগে টেক্সট লিখুন বা জেনারেট করুন");
    return;
  }

  speakBtn.disabled = true;
  speakBtn.textContent = "লোড হচ্ছে...";
  try {
    await speakWithGoogleTTS(text);
  } catch (e) {
    const message = String(e.message || "Unknown error");
    if (message.includes("403")) {
      alert("Permission error (403)। API key restriction, billing, বা API enable চেক করুন।");
    } else if (message.includes("400")) {
      alert("Bad request (400)। টেক্সট খালি কি না, language/voice valid কি না চেক করুন।");
    } else {
      alert(`সমস্যা হয়েছে: ${message}`);
    }
  } finally {
    speakBtn.disabled = false;
    speakBtn.textContent = "🔊 ভয়েস প্লে";
  }
});
