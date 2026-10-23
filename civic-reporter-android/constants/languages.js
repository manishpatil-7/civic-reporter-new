export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
];

export const AUTHORITY_TYPES = [
  {
    value: "gram_panchayat",
    label: "Gram Panchayat",
    iconKey: "Home",
    badgeColor: "#059669",
    badgeBg: "#ECFDF5",
    title: "The Sarpanch",
    desc: "Rural & Village Administration",
  },
  {
    value: "municipal_council",
    label: "Municipal Council",
    iconKey: "Landmark",
    badgeColor: "#0284C7",
    badgeBg: "#F0F9FF",
    title: "The Chief Officer",
    desc: "Town & Nagar Palika",
  },
  {
    value: "municipal_corporation",
    label: "Municipal Corporation",
    iconKey: "Building2",
    badgeColor: "#6366F1",
    badgeBg: "#EEF2FF",
    title: "The Municipal Commissioner",
    desc: "Metropolitan & City Civic Body",
  },
];

export default LANGUAGES;
