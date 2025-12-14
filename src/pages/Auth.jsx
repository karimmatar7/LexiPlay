import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, loginUser } from "../utils/user.js";

export default function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!name || !pin) return setError("Vul beide velden in");
    const user = await loginUser(name, pin);
    if (!user) return setError("Gebruiker niet gevonden of fout PIN");
    localStorage.setItem("lexiplay_user", JSON.stringify(user));
    onLogin(user);
    navigate("/menu");
  };

  const handleRegister = async () => {
    if (!name || !pin) return setError("Vul beide velden in");
    const user = await createUser(name, pin);
    if (!user) return setError("Registratie mislukt");
    localStorage.setItem("lexiplay_user", JSON.stringify(user));
    onLogin(user);
    navigate("/menu");
  };

  const handleGuest = () => {
    const guest = { id: "guest", name: "Gast", rewards: 0, progress: {} };
    localStorage.setItem("lexiplay_user", JSON.stringify(guest));
    onLogin(guest);
    navigate("/menu");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full opacity-40" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-300 rounded-full opacity-30" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-300 rounded-full opacity-35" />

      <div className="relative bg-white rounded-3xl shadow-lg border-4 border-purple-300 p-8 md:p-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-6 mb-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-sm">
            <img src="/fox.png" alt="LexiPlay Logo" className="w-24 h-24 md:w-28 md:h-28 mx-auto" />
          </div>
          <h1 className="text-4xl font-black text-purple-700" style={{ letterSpacing: "-0.02em" }}>
            Welkom bij LexiPlay!
          </h1>
          <p className="text-base text-gray-600 font-medium">
            Log in om je avontuur te beginnen
          </p>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">👤 Naam</label>
            <input
              type="text"
              placeholder="Typ je naam hier..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">🔒 PIN Code</label>
            <input
              type="password"
              placeholder="Typ je PIN hier..."
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength="10"
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-gray-50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogin}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-md border-b-4 border-indigo-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            🔑 Login
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-md border-b-4 border-green-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            ✨ Registreer
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200" />
          </div>
          <span className="relative px-4 bg-white text-sm font-medium text-gray-500">of</span>
        </div>

        {/* Guest Button */}
        <button
          onClick={handleGuest}
          className="w-full bg-white hover:bg-purple-50 text-purple-600 py-4 px-6 rounded-xl text-lg font-bold border-2 border-purple-400 hover:border-purple-500 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
        >
          🎮 Verder gaan als gast
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-100 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-700 font-bold text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Helper Text */}
        <div className="text-center text-xs text-gray-500 mt-2">
          🛡️ Je gegevens zijn veilig bij LexiPlay
        </div>
      </div>
    </div>
  );
}
