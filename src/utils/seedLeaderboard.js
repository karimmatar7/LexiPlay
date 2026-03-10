// src/utils/seedLeaderboard.js
import { supabase } from "../supaBaseClient";

const FAKE_USERS = [
  { name: "LucasB",  score: 34, highScore: 41, avatar: { bg: 5, skin: 1, hair: 2, hairShape: "short",  eyeShape: "round",  mouthShape: "grin",    outfit: 0, accessory: "glasses" } },
  { name: "SofieV",  score: 22, highScore: 38, avatar: { bg: 4, skin: 0, hair: 5, hairShape: "long",   eyeShape: "almond", mouthShape: "smile",   outfit: 1, accessory: "bow"     } },
  { name: "NinoK",   score: 18, highScore: 29, avatar: { bg: 2, skin: 3, hair: 1, hairShape: "mohawk", eyeShape: "star",   mouthShape: "grin",    outfit: 4, accessory: "hat"     } },
  { name: "EmmaD",   score: 27, highScore: 27, avatar: { bg: 0, skin: 0, hair: 6, hairShape: "bun",    eyeShape: "round",  mouthShape: "smile",   outfit: 2, accessory: "bow"     } },
  { name: "RubenM",  score: 5,  highScore: 21, avatar: { bg: 1, skin: 2, hair: 0, hairShape: "curly",  eyeShape: "sleepy", mouthShape: "smirk",   outfit: 5, accessory: "none"    } },
  { name: "JadeP",   score: 15, highScore: 19, avatar: { bg: 6, skin: 1, hair: 4, hairShape: "long",   eyeShape: "almond", mouthShape: "open",    outfit: 3, accessory: "glasses" } },
  { name: "ThomasW", score: 9,  highScore: 14, avatar: { bg: 3, skin: 4, hair: 2, hairShape: "short",  eyeShape: "round",  mouthShape: "neutral", outfit: 6, accessory: "hat"     } },
  { name: "LenaS",   score: 11, highScore: 11, avatar: { bg: 7, skin: 0, hair: 7, hairShape: "curly",  eyeShape: "star",   mouthShape: "smile",   outfit: 1, accessory: "bow"     } },
  { name: "ArthurG", score: 3,  highScore: 8,  avatar: { bg: 2, skin: 5, hair: 3, hairShape: "bun",    eyeShape: "sleepy", mouthShape: "smirk",   outfit: 7, accessory: "none"    } },
  { name: "ZoeH",    score: 1,  highScore: 4,  avatar: { bg: 4, skin: 1, hair: 6, hairShape: "long",   eyeShape: "almond", mouthShape: "grin",    outfit: 2, accessory: "glasses" } },
];

export async function seedLeaderboard() {
  const results = [];

  for (const u of FAKE_USERS) {
    const { data, error } = await supabase
      .from("users")
      .insert({
        name: u.name,
        pin:  "0000",
        avatar: u.avatar,           // ← top-level column, matches your schema
        progress: {
          xp:       u.highScore * 10,
          level:    Math.max(1, Math.floor(u.highScore / 10)),
          currency: { keys: Math.floor(u.highScore / 4) },
          letterDraw: {
            score:        u.score,
            highScore:    u.highScore,
            hearts:       5,
            cooldownUntil: null,
          },
        },
      })
      .select("id, name")
      .single();

    if (error) console.warn(`❌ Failed to insert ${u.name}:`, error.message);
    else       results.push(data);
  }

  console.log("✅ Seeded users:", results);
  return results;
}
