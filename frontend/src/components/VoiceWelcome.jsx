import { useEffect } from "react";

export default function VoiceWelcome() {
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const msg = new SpeechSynthesisUtterance(
        "خوش آمدید مائیکرو نیسا میں"
      );
      msg.lang = "ur-PK";
      window.speechSynthesis.speak(msg);
    }
  }, []);

  return null;
}