export const AVATAR_PARTS = {
  skin: [
    { id: "light",   emoji: "🟡", label: { en: "Light",  fr: "Claire",  nl: "Licht"   } },
    { id: "medium",  emoji: "🟠", label: { en: "Medium", fr: "Moyenne", nl: "Middel"  } },
    { id: "dark",    emoji: "🟤", label: { en: "Dark",   fr: "Foncée",  nl: "Donker"  } },
  ],

  eyes: [
    { id: "normal",  emoji: "👀", label: { en: "Normal", fr: "Normal",  nl: "Normaal"  } },
    { id: "happy",   emoji: "😊", label: { en: "Happy",  fr: "Content", nl: "Blij"     } },
    { id: "cool",    emoji: "😎", label: { en: "Cool",   fr: "Cool",    nl: "Cool"     } },
    { id: "sleepy",  emoji: "😴", label: { en: "Sleepy", fr: "Endormi", nl: "Slaperig" } },
    { id: "star",    emoji: "🤩", label: { en: "Star",   fr: "Étoile",  nl: "Ster"     }, locked: true, keyCost: 2 },
    { id: "wink",    emoji: "😉", label: { en: "Wink",   fr: "Clin d'œil", nl: "Knipoog" }, locked: true, keyCost: 2 },
  ],

  mouth: [
    { id: "smile",   emoji: "😄", label: { en: "Smile",  fr: "Sourire",       nl: "Glimlach" } },
    { id: "grin",    emoji: "😁", label: { en: "Grin",   fr: "Grand sourire", nl: "Grijs"    } },
    { id: "tongue",  emoji: "😛", label: { en: "Tongue", fr: "Langue",        nl: "Tong"     } },
    { id: "cool",    emoji: "😏", label: { en: "Cool",   fr: "Malin",         nl: "Stoer"    }, locked: true, keyCost: 2 },
    { id: "open",    emoji: "😮", label: { en: "Open",   fr: "Ouvert",        nl: "Open"     }, locked: true, keyCost: 2 },
  ],

  hair: [
    { id: "none",    emoji: "🧑", label: { en: "None",   fr: "Aucun",     nl: "Geen"     } },
    { id: "short",   emoji: "👦", label: { en: "Short",  fr: "Court",     nl: "Kort"     } },
    { id: "long",    emoji: "👧", label: { en: "Long",   fr: "Long",      nl: "Lang"     } },
    { id: "curly",   emoji: "🧒", label: { en: "Curly",  fr: "Bouclé",    nl: "Krullend" }, locked: true, keyCost: 3 },
    { id: "bun",     emoji: "💁", label: { en: "Bun",    fr: "Chignon",   nl: "Knot"     }, locked: true, keyCost: 3 },
    { id: "cap",     emoji: "🧢", label: { en: "Cap",    fr: "Casquette", nl: "Pet"      }, locked: true, keyCost: 4 },
    { id: "crown",   emoji: "👑", label: { en: "Crown",  fr: "Couronne",  nl: "Kroon"    }, locked: true, keyCost: 6 },
  ],

  outfit: [
    { id: "tshirt",    emoji: "👕",   label: { en: "T-Shirt",   fr: "T-Shirt",    nl: "T-Shirt"   } },
    { id: "hoodie",    emoji: "🥷",   label: { en: "Hoodie",    fr: "Sweat",      nl: "Hoodie"    } },
    { id: "suit",      emoji: "🤵",   label: { en: "Suit",      fr: "Costume",    nl: "Pak"       }, locked: true, keyCost: 4 },
    { id: "dress",     emoji: "👗",   label: { en: "Dress",     fr: "Robe",       nl: "Jurk"      }, locked: true, keyCost: 4 },
    { id: "wizard",    emoji: "🧙",   label: { en: "Wizard",    fr: "Sorcier",    nl: "Tovenaar"  }, locked: true, keyCost: 6 },
    { id: "ninja",     emoji: "🥷",   label: { en: "Ninja",     fr: "Ninja",      nl: "Ninja"     }, locked: true, keyCost: 5 },
    { id: "astronaut", emoji: "👨‍🚀", label: { en: "Astronaut", fr: "Astronaute", nl: "Astronaut" }, locked: true, keyCost: 8 },
  ],

  accessory: [
    { id: "none",    emoji: "✖️", label: { en: "None",    fr: "Aucun",    nl: "Geen"   } },
    { id: "glasses", emoji: "🤓", label: { en: "Glasses", fr: "Lunettes", nl: "Bril"   }, locked: true, keyCost: 2 },
    { id: "bow",     emoji: "🎀", label: { en: "Bow",     fr: "Nœud",     nl: "Strik"  }, locked: true, keyCost: 2 },
    { id: "flower",  emoji: "🌸", label: { en: "Flower",  fr: "Fleur",    nl: "Bloem"  }, locked: true, keyCost: 3 },
    { id: "horn",    emoji: "🦄", label: { en: "Horn",    fr: "Corne",    nl: "Hoorn"  }, locked: true, keyCost: 4 },
    { id: "halo",    emoji: "😇", label: { en: "Halo",    fr: "Halo",     nl: "Halo"   }, locked: true, keyCost: 5 },
    { id: "mask",    emoji: "🦸", label: { en: "Hero",    fr: "Héros",    nl: "Held"   }, locked: true, keyCost: 5 },
  ],

  bg: [
    { id: "sky",    color: "linear-gradient(135deg,#bae6fd,#e0f2fe)", label: { en: "Sky",    fr: "Ciel",    nl: "Lucht"        } },
    { id: "sunset", color: "linear-gradient(135deg,#fde68a,#fca5a5)", label: { en: "Sunset", fr: "Coucher", nl: "Zonsondergang"} },
    { id: "forest", color: "linear-gradient(135deg,#bbf7d0,#6ee7b7)", label: { en: "Forest", fr: "Forêt",   nl: "Bos"          } },
    { id: "night",  color: "linear-gradient(135deg,#1e1b4b,#4338ca)", label: { en: "Night",  fr: "Nuit",    nl: "Nacht"        } },
    { id: "candy",  color: "linear-gradient(135deg,#f9a8d4,#c084fc)", label: { en: "Candy",  fr: "Bonbon",  nl: "Snoep"        } },
    { id: "fire",   color: "linear-gradient(135deg,#fbbf24,#ef4444)", label: { en: "Fire",   fr: "Feu",     nl: "Vuur"         } },
    { id: "ocean",  color: "linear-gradient(135deg,#67e8f9,#3b82f6)", label: { en: "Ocean",  fr: "Océan",   nl: "Oceaan"       } },
  ],
}

export const DEFAULT_AVATAR = {
    gender:    "male",  
  skin:      "light",
  eyes:      "happy",
  mouth:     "smile",
  hair:      "short",
  outfit:    "tshirt",
  accessory: "none",
  bg:        "sky",
}

export const SKIN_TONES = {
  light:  { face: "#FDDBB4", cheek: "#F9B8B8" },
  medium: { face: "#D4956A", cheek: "#C47A55" },
  dark:   { face: "#8D5524", cheek: "#7A4A1E" },
}

export const HAIR_STYLES = {
  none:  { top: null,      extra: null    },
  short: { top: "#3D2314", extra: null    },
  long:  { top: "#3D2314", extra: "long"  },
  curly: { top: "#6B3A2A", extra: "curly" },
  bun:   { top: "#3D2314", extra: "bun"   },
  cap:   { top: null,      extra: "cap"   },
  crown: { top: null,      extra: "crown" },
}

export function getLabel(item, language = "en") {
  if (!item?.label) return ""
  if (typeof item.label === "string") return item.label
  const lang = (language || "en").toLowerCase()
  if (lang.startsWith("fr")) return item.label.fr || item.label.en
  if (lang.startsWith("nl")) return item.label.nl || item.label.en
  return item.label.en
}
