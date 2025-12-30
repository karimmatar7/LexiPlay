import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { updateSettings, getUser } from "../utils/user.js"
import NotificationModal from "../components/NotificationModal"

export default function ParentalUnlockPage({ user, setUnlocked }) {
  const [pin, setPin] = useState("")
  const [existingPin, setExistingPin] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({ message: "", type: "error" })
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchPin() {
      if (!user?.id) return
      const latestUser = await getUser(user.id)
      const pinFromSettings = latestUser?.settings?.parentalPin || null
      setExistingPin(pinFromSettings)
    }
    fetchPin()
  }, [user])

  const handleUnlock = async () => {
    if (!existingPin) {
      if (pin.length < 4) {
        setModalConfig({ message: "PIN moet minstens 4 cijfers zijn", type: "error" })
        setShowModal(true)
        return
      }
      await updateSettings(user.id, { parentalPin: pin })
      setExistingPin(pin)
      setPin("")
      setModalConfig({ message: "PIN ingesteld! Voer het opnieuw in om toegang te krijgen.", type: "success" })
      setShowModal(true)
      return
    }

    if (pin === existingPin) {
      if (setUnlocked) setUnlocked(true)
      navigate("/parental-control")
    } else {
      setModalConfig({ message: "Fout PIN, probeer opnieuw!", type: "error" })
      setShowModal(true)
      setPin("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUnlock()
    }
  }

  return (
    <div className="min-h-screen bg-indigo-50 p-6 md:p-8 relative">
      {/* Decorative shapes */}
      <div className="absolute top-12 left-12 w-32 h-32 bg-purple-200 rounded-full opacity-30" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-200 rounded-full opacity-25" />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 bg-white rounded-3xl p-8 shadow-sm border-4 border-indigo-300">
            <span className="text-7xl">🔐</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 text-indigo-700" style={{ letterSpacing: '-0.02em' }}>
            {existingPin ? "Ouderlijk Toegang" : "Stel PIN in"}
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            {existingPin ? "Voer je PIN in om toegang te krijgen" : "Maak een nieuwe PIN van minimaal 4 cijfers"}
          </p>
        </div>

        {/* PIN Input Card */}
        <div className="bg-white rounded-3xl shadow-sm border-2 p-8 mb-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  {existingPin ? "Voer PIN in" : "Nieuwe PIN"}
                </label>
                <input
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-6 py-4 text-2xl font-bold text-center tracking-widest rounded-2xl border-3 border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all"
                  maxLength="6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleUnlock}
            className="flex-1 text-center group inline-flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg border-b-4 border-purple-800 transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl">{existingPin ? "🔓" : "✨"}</span>
            <span>{existingPin ? "Ontgrendel" : "PIN Instellen"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="flex-1 text-center group inline-flex items-center justify-center gap-3 bg-gray-400 hover:bg-gray-500 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg border-b-4 border-gray-600 transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl">🏠</span>
            <span>Terug naar Menu</span>
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  )
}
