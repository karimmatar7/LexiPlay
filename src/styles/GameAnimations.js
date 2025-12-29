export const gameAnimations = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes pop {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  .float-anim { animation: float 3s ease-in-out infinite; }
  .shake-anim { animation: shake 0.5s ease-in-out; }
  .pulse-anim { animation: pulse 1s ease-in-out infinite; }
  .pop-anim { animation: pop 0.3s ease-out; }
`
