import React, { createContext, useState, useContext, useEffect } from "react"

const SettingsContext = createContext()

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }) {
  const [fontType, setFontType] = useState("normal")
  const [fontSize, setFontSize] = useState("medium")
  const [soundOn, setSoundOn] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    switch (fontSize) {
      case "small":
        root.style.setProperty("--font-size", "0.9rem")
        break
      case "large":
        root.style.setProperty("--font-size", "1.3rem")
        break
      default:
        root.style.setProperty("--font-size", "1rem")
    }
  }, [fontSize])

  const value = {
    fontType,
    setFontType,
    fontSize,
    setFontSize,
    soundOn,
    setSoundOn,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
