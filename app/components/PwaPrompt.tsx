"use client";

import { useCallback, useEffect, useState } from "react";
import { useModal } from "../providers/ModalProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpFromBracket,
  faEllipsisV,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const LOCAL_STORAGE_PROMPT_SHOWN_KEY = "pwaPromptLastShown";
const DELAY_BEFORE_SHOWING_PROMPT_MS = 3 * 1000;
const REPROMPT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export const PwaPrompt = () => {
  const [platform, setPlatform] = useState<
    "android" | "ios" | "desktop" | null
  >(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { setModal } = useModal();

  const isPwa = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    const isIos = (window.navigator as any).standalone === true;

    const isAndroid =
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches;

    return isIos || isAndroid;
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua =
        navigator.userAgent || navigator.vendor || (window as any).opera || "";

      if (/android/i.test(ua)) {
        setPlatform("android");
      } else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
        setPlatform("ios");
      } else {
        setPlatform("desktop");
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  useEffect(() => {
    if (platform && platform !== "desktop" && !isPwa()) {
      const lastShown = localStorage.getItem(LOCAL_STORAGE_PROMPT_SHOWN_KEY);
      const now = new Date().getTime();

      if (!lastShown || now - parseInt(lastShown, 10) > REPROMPT_INTERVAL_MS) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, DELAY_BEFORE_SHOWING_PROMPT_MS);

        return () => clearTimeout(timer);
      }
    }
  }, [platform, isPwa]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      toast.error("Nie można zainstalować aplikacji automatycznie.");
      return;
    }

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      toast.success("Aplikacja została zainstalowana!");
    } else {
      toast.error("Instalacja została anulowana.");
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
    localStorage.setItem(
      LOCAL_STORAGE_PROMPT_SHOWN_KEY,
      new Date().getTime().toString()
    );
    setModal(null);
  }, [deferredPrompt, setModal]);

  const handleDialogClose = useCallback(() => {
    setModal(null);
    setShowPrompt(false);
    localStorage.setItem(
      LOCAL_STORAGE_PROMPT_SHOWN_KEY,
      new Date().getTime().toString()
    );
  }, [setModal]);

  useEffect(() => {
    if (showPrompt && !isPwa()) {
      setModal({
        title: "Add Syncro to Home Page",
        content: (
          <>
            <h3>
              To access and use Syncro like a native app, add it to your home
              screen!
            </h3>

            <span>How to install:</span>
            <ol className="pwalist">
              {platform === "ios" ? (
                <>
                  <li>
                    Open Syncro in <b>Safari</b>.
                  </li>
                  <li>
                    <span>
                      Tap the <b>Share</b> icon{" "}
                      <FontAwesomeIcon icon={faArrowUpFromBracket} /> .
                    </span>
                  </li>
                  <li>
                    Tap <b>,,Add to Home Screen&quot;</b>.
                  </li>
                  <li>
                    Tap <b>,,Add&quot;</b> in the top right corner.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <span>
                      Open the browser menu{" "}
                      <FontAwesomeIcon icon={faEllipsisV} /> .
                    </span>
                  </li>
                  <li>
                    Tap <b>,,Install app&quot;</b> or{" "}
                    <b>,,Add to home screen&quot;</b>.
                  </li>
                  <li>
                    Confirm by tapping <b>,,Add&quot;</b>.
                  </li>
                </>
              )}
            </ol>

            <p>
              ✅ That&apos;s it! The Syncro icon will now appear on your home
              screen like a native app.
            </p>
            <p>
              🔒 No need for installation or updates - you&apos;ll always have
              the latest version at your fingertips
            </p>
          </>
        ),
        bottom: (
          <>
            {platform == "ios" ? (
              <button onClick={handleDialogClose}>Done!</button>
            ) : (
              <button onClick={handleInstall}>Install now</button>
            )}

            <button className="secondary" onClick={handleDialogClose}>
              Close
            </button>
          </>
        ),
        setModal,
      });
    }
  }, [showPrompt, platform, isPwa, setModal, handleDialogClose, handleInstall]);

  return <></>;
};
