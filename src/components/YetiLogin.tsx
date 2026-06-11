/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { User, UserRole } from "../types";
import { ShieldCheck, User as UserIcon, Keyboard, KeyRound, AlertCircle, Plus, Sparkles, LogIn, Trash2, Heart } from "lucide-react";

interface YetiLoginProps {
  users: User[];
  onLoginSuccess: (user: User, token: string) => void;
  onResetDatabase: () => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?fit=facearea&facepad=2&w=256&h=256&q=80"
];

export default function YetiLogin({
  users,
  onLoginSuccess,
  onResetDatabase
}: YetiLoginProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Sandboxed Secure SSO profile selectors
  const [ssoProvider, setSsoProvider] = useState<"Google" | "Facebook" | null>(null);
  const [ssoEmail, setSsoEmail] = useState("");
  const [ssoName, setSsoName] = useState("");
  const [ssoAvatar, setSsoAvatar] = useState(AVATAR_PRESETS[1]);

  // New user registration fields
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regAvatar, setRegAvatar] = useState(AVATAR_PRESETS[0]);

  // Alert and feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");
  const [redirectedUser, setRedirectedUser] = useState<User | null>(null);

  // Controls for Yeti interaction
  const containerRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [eyesCovered, setEyesCovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const blinkingRef = useRef<any>(null);
  const activeElementRef = useRef<string | null>(null);

  const eyeScale = useRef(1);
  const dFromC = useRef(0);
  const isMobile = useRef(false);

  // Detect mobile
  useEffect(() => {
    isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile.current) {
      setShowPassword(true);
    }
  }, []);

  // Set up blinking and initialization
  useEffect(() => {
    if (!containerRef.current) return;

    // Set initial arms position
    const armL = containerRef.current.querySelector(".armL");
    const armR = containerRef.current.querySelector(".armR");
    const mouth = containerRef.current.querySelector(".mouth");

    gsap.set(armL, { x: -93, y: 220, rotation: 105, transformOrigin: "top left" });
    gsap.set(armR, { x: -93, y: 220, rotation: -105, transformOrigin: "top right" });
    gsap.set(mouth, { transformOrigin: "center center" });

    // Blink timer loop
    const triggerBlink = () => {
      const eyeL = containerRef.current?.querySelector(".eyeL");
      const eyeR = containerRef.current?.querySelector(".eyeR");
      if (!eyeL || !eyeR) return;

      blinkingRef.current = gsap.to([eyeL, eyeR], {
        duration: 0.1,
        scaleY: 0,
        yoyo: true,
        repeat: 1,
        transformOrigin: "center center",
        onComplete: () => {
          const timeout = 3000 + Math.random() * 6000;
          setTimeout(triggerBlink, timeout);
        }
      });
    };

    triggerBlink();

    return () => {
      if (blinkingRef.current) blinkingRef.current.kill();
    };
  }, [mode]);

  // Reset face elements to flat
  const resetFace = () => {
    if (!containerRef.current) return;
    const eyeL = containerRef.current.querySelector(".eyeL");
    const eyeR = containerRef.current.querySelector(".eyeR");
    const nose = containerRef.current.querySelector(".nose");
    const mouth = containerRef.current.querySelector(".mouth");
    const chin = containerRef.current.querySelector(".chin");
    const face = containerRef.current.querySelector(".face");
    const eyebrow = containerRef.current.querySelector(".eyebrow");
    const outerEarL = containerRef.current.querySelector(".earL .outerEar");
    const outerEarR = containerRef.current.querySelector(".earR .outerEar");
    const earHairL = containerRef.current.querySelector(".earL .earHair");
    const earHairR = containerRef.current.querySelector(".earR .earHair");
    const hair = containerRef.current.querySelector(".hair");

    gsap.to([eyeL, eyeR], { duration: 0.8, x: 0, y: 0, ease: "expo.out" });
    gsap.to(nose, { duration: 0.8, x: 0, y: 0, scaleX: 1, scaleY: 1, ease: "expo.out" });
    gsap.to(mouth, { duration: 0.8, x: 0, y: 0, rotation: 0, ease: "expo.out" });
    gsap.to(chin, { duration: 0.8, x: 0, y: 0, scaleY: 1, ease: "expo.out" });
    gsap.to([face, eyebrow], { duration: 0.8, x: 0, y: 0, skewX: 0, ease: "expo.out" });
    gsap.to([outerEarL, outerEarR, earHairL, earHairR, hair], { duration: 0.8, x: 0, y: 0, scaleY: 1, ease: "expo.out" });
  };

  // Cover eyes animation
  const coverEyes = () => {
    if (!containerRef.current) return;
    const armL = containerRef.current.querySelector(".armL");
    const armR = containerRef.current.querySelector(".armR");
    const bodyBGnormal = containerRef.current.querySelector(".bodyBGnormal");
    const bodyBGchanged = containerRef.current.querySelector(".bodyBGchanged");

    gsap.killTweensOf([armL, armR]);
    gsap.set([armL, armR], { visibility: "visible" });
    gsap.to(armL, { duration: 0.45, x: -93, y: 10, rotation: 0, ease: "quad.out" });
    gsap.to(armR, { duration: 0.45, x: -93, y: 10, rotation: 0, ease: "quad.out", delay: 0.1 });
    
    // SVG morph outline emulation
    if (bodyBGnormal && bodyBGchanged) {
      gsap.to(bodyBGnormal, { duration: 0.45, opacity: 0, ease: "quad.out" });
      gsap.to(bodyBGchanged, { duration: 0.45, opacity: 1, display: "block", ease: "quad.out" });
    }
    setEyesCovered(true);
  };

  const uncoverEyes = () => {
    if (!containerRef.current) return;
    const armL = containerRef.current.querySelector(".armL");
    const armR = containerRef.current.querySelector(".armR");
    const bodyBGnormal = containerRef.current.querySelector(".bodyBGnormal");
    const bodyBGchanged = containerRef.current.querySelector(".bodyBGchanged");

    gsap.killTweensOf([armL, armR]);
    gsap.to(armL, { duration: 0.85, y: 220, rotation: 105, ease: "quad.out" });
    gsap.to(armR, { duration: 0.85, y: 220, rotation: -105, ease: "quad.out", delay: 0.05, onComplete: () => {
      gsap.set([armL, armR], { visibility: "hidden" });
    }});

    if (bodyBGnormal && bodyBGchanged) {
      gsap.to(bodyBGnormal, { duration: 0.45, opacity: 1, ease: "quad.out" });
      gsap.to(bodyBGchanged, { duration: 0.45, opacity: 0, display: "none", ease: "quad.out" });
    }
    setEyesCovered(false);
  };

  // Spreading/closing fingers on show password toggle
  useEffect(() => {
    if (!containerRef.current || !eyesCovered) return;
    const twoFingers = containerRef.current.querySelector(".twoFingers");
    if (!twoFingers) return;

    if (showPassword) {
      gsap.to(twoFingers, { duration: 0.35, transformOrigin: "bottom left", rotation: 30, x: -9, y: -2, ease: "power2.inOut" });
    } else {
      gsap.to(twoFingers, { duration: 0.35, transformOrigin: "bottom left", rotation: 0, x: 0, y: 0, ease: "power2.inOut" });
    }
  }, [showPassword, eyesCovered]);

  const getCaretGlobalCoords = (input: HTMLInputElement): { x: number; y: number } | null => {
    if (!input) return null;
    const rect = input.getBoundingClientRect();
    const selectionStart = input.selectionEnd || 0;
    
    // Create a mirror div styled identically to copy key layout properties
    const mirror = document.createElement("div");
    const computed = window.getComputedStyle(input);
    
    // Style properties to copy:
    const stylesToCopy = [
      "font-family", "font-weight", "font-size", "font-style", "letter-spacing",
      "text-transform", "text-indent", "padding-left", "padding-right", "padding-top",
      "box-sizing", "border-width", "font-stretch"
    ];
    
    for (const style of stylesToCopy) {
      mirror.style.setProperty(style, computed.getPropertyValue(style));
    }
    
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    // Avoid any line wrapping mismatch:
    mirror.style.width = computed.width; 
    mirror.style.top = "-9999px";
    mirror.style.left = "-9999px";
    
    // Content slice up to cursor position
    const textVal = input.value.substring(0, selectionStart);
    mirror.textContent = textVal;
    
    // Append span spacer
    const span = document.createElement("span");
    span.textContent = "|";
    mirror.appendChild(span);
    
    document.body.appendChild(mirror);
    
    const spanRect = span.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();
    document.body.removeChild(mirror);
    
    // Calculate relative X/Y
    const caretXOffset = spanRect.left - mirrorRect.left;
    
    return {
      x: rect.left + window.scrollX + caretXOffset + parseFloat(computed.paddingLeft || "16"),
      y: rect.top + window.scrollY + rect.height / 2 // Use vertical middle of input for focus stability
    };
  };

  const handleEmailInput = (val: string) => {
    if (!containerRef.current || !emailInputRef.current) return;

    const emailInput = emailInputRef.current;
    
    const eyeL = containerRef.current.querySelector(".eyeL");
    const eyeR = containerRef.current.querySelector(".eyeR");
    const nose = containerRef.current.querySelector(".nose");
    const mouth = containerRef.current.querySelector(".mouth");
    const chin = containerRef.current.querySelector(".chin");
    const face = containerRef.current.querySelector(".face");
    const eyebrow = containerRef.current.querySelector(".eyebrow");
    const outerEarL = containerRef.current.querySelector(".earL .outerEar");
    const outerEarR = containerRef.current.querySelector(".earR .outerEar");
    const earHairL = containerRef.current.querySelector(".earL .earHair");
    const earHairR = containerRef.current.querySelector(".earR .earHair");
    const hair = containerRef.current.querySelector(".hair");

    if (!eyeL || !eyeR || !nose || !mouth || !chin || !face || !eyebrow) return;

    const getElCoords = (el: Element) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 + window.scrollX,
        y: r.top + r.height / 2 + window.scrollY
      };
    };

    const eyeLCoords = getElCoords(eyeL);
    const eyeRCoords = getElCoords(eyeR);
    const noseCoords = getElCoords(nose);
    const mouthCoords = getElCoords(mouth);
    const chinCoords = getElCoords(chin);
    const faceCoords = getElCoords(face);
    const eyebrowCoords = getElCoords(eyebrow);

    const caretCoords = getCaretGlobalCoords(emailInput);
    if (!caretCoords) return;

    // Standard trigonometry calculations matching classic Yeti
    const getAngle = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.atan2(y2 - y1, x2 - x1);
    };

    // We add 30px offset on y to look nicely slightly below the input center/caret line
    const targetYOffset = 30; 
    const targetX = caretCoords.x;
    const targetY = caretCoords.y + targetYOffset;

    const eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, targetX, targetY);
    const eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, targetX, targetY);
    const noseAngle = getAngle(noseCoords.x, noseCoords.y, targetX, targetY);
    const mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, targetX, targetY);
    const chinAngle = getAngle(chinCoords.x, chinCoords.y, targetX, targetY);
    const faceAngle = getAngle(faceCoords.x, faceCoords.y, targetX, targetY);
    const eyebrowAngle = getAngle(eyebrowCoords.x, eyebrowCoords.y, targetX, targetY);

    // Calculate displacement vectors matching classic Yeti multipliers
    // Note: cosine/sine output moves in direction of vector.
    const eyeLX = Math.cos(eyeLAngle) * 11.5;
    const eyeLY = Math.sin(eyeLAngle) * 5;
    const eyeRX = Math.cos(eyeRAngle) * 11.5;
    const eyeRY = Math.sin(eyeRAngle) * 5;

    const noseX = Math.cos(noseAngle) * 15;
    const noseY = Math.sin(noseAngle) * 10;

    const mouthX = Math.cos(mouthAngle) * 12;
    const mouthY = Math.sin(mouthAngle) * 8.5;
    const mouthR = Math.cos(mouthAngle) * 4;

    const chinX = Math.cos(chinAngle) * 12;
    const chinY = Math.sin(chinAngle) * 6.5;

    const faceX = Math.cos(faceAngle) * 7.5;
    const faceY = Math.sin(faceAngle) * 5.5;

    const eyebrowX = Math.cos(eyebrowAngle) * 8;
    const eyebrowY = Math.sin(eyebrowAngle) * 6;

    // Outer ears move opposite to simulate perspective depth rotation
    const outerEarLX = -Math.cos(eyeLAngle) * 4;
    const outerEarLY = -Math.sin(eyeLAngle) * 2;
    const outerEarRX = -Math.cos(eyeRAngle) * 4;
    const outerEarRY = -Math.sin(eyeRAngle) * 2;

    const earHairLX = Math.cos(eyeLAngle) * 4;
    const earHairLY = Math.sin(eyeLAngle) * 2;
    const earHairRX = Math.cos(eyeRAngle) * 4;
    const earHairRY = Math.sin(eyeRAngle) * 2;

    const hairX = Math.cos(faceAngle) * 6.5;
    const hairY = Math.sin(faceAngle) * 2;

    // Tweens using precise computed values
    gsap.to(eyeL, { duration: 0.1, x: eyeLX, y: eyeLY, ease: "power1.out" });
    gsap.to(eyeR, { duration: 0.1, x: eyeRX, y: eyeRY, ease: "power1.out" });
    gsap.to(nose, { duration: 0.15, x: noseX, y: noseY, ease: "power1.out" });
    gsap.to(mouth, { duration: 0.15, x: mouthX, y: mouthY, rotation: mouthR, transformOrigin: "center center", ease: "power1.out" });
    gsap.to(chin, { duration: 0.15, x: chinX, y: chinY, ease: "power1.out" });
    gsap.to(face, { duration: 0.15, x: faceX, y: faceY, ease: "power1.out" });
    gsap.to(eyebrow, { duration: 0.15, x: eyebrowX, y: eyebrowY, ease: "power1.out" });

    if (outerEarL) gsap.to(outerEarL, { duration: 0.15, x: outerEarLX, y: outerEarLY, ease: "power1.out" });
    if (outerEarR) gsap.to(outerEarR, { duration: 0.15, x: outerEarRX, y: outerEarRY, ease: "power1.out" });
    if (earHairL) gsap.to(earHairL, { duration: 0.15, x: earHairLX, y: earHairLY, ease: "power1.out" });
    if (earHairR) gsap.to(earHairR, { duration: 0.15, x: earHairRX, y: earHairRY, ease: "power1.out" });
    if (hair) gsap.to(hair, { duration: 0.15, x: hairX, y: hairY, ease: "power1.out" });

    // Emulate mouth and eyes changing shapes based on character content
    const mouthBG = containerRef.current.querySelector(".mouthBG");
    const mouthLargeBG = containerRef.current.querySelector(".mouthLargeBG");
    const len = val.length;
    if (len > 0) {
      if (val.includes("@")) {
        gsap.to([eyeL, eyeR], { duration: 0.2, scaleX: 0.75, scaleY: 0.75, transformOrigin: "center center" });
        if (mouthBG && mouthLargeBG) {
          gsap.to(mouthBG, { duration: 0.2, scaleY: 1.4, transformOrigin: "center center" });
        }
      } else {
        gsap.to([eyeL, eyeR], { duration: 0.2, scaleX: 0.9, scaleY: 0.9, transformOrigin: "center center" });
        if (mouthBG) {
          gsap.to(mouthBG, { duration: 0.2, scaleY: 1.1, transformOrigin: "center center" });
        }
      }
    } else {
      gsap.to([eyeL, eyeR], { duration: 0.2, scaleX: 1, scaleY: 1, transformOrigin: "center center" });
      if (mouthBG) {
        gsap.to(mouthBG, { duration: 0.2, scaleY: 1, transformOrigin: "center center" });
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!emailOrUser.trim() || !password.trim()) {
      setErrorMsg("Please formulate both your registration key and password instructions.");
      return;
    }

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUser: emailOrUser.trim(), password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to log in with returned code.");
      }

      // Login success: initiate the transition redirection overlay
      setRedirectedUser(data.user);
      setRedirecting(true);

      const route = data.user.role === UserRole.CEO 
        ? "/ceo/dashboard" 
        : data.user.role === UserRole.MANAGER 
          ? "/manager/dashboard" 
          : data.user.role === UserRole.ASSISTANT_MANAGER 
            ? "/assistant-manager/dashboard" 
            : "/agent/dashboard";
      
      setRedirectPath(route);

      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        setRedirecting(false);
      }, 1800);

    } catch (err: any) {
      setErrorMsg(err.message || "Incorrect credentials. No enterprise profile matches the input information.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg("Required registration values must not remain empty.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Password credentials do not match confirmed entry.");
      return;
    }

    try {
      const resp = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          username: regUsername.trim().toLowerCase(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
          phone: regPhone.trim() || undefined,
          avatar: regAvatar
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to establish new profile.");
      }

      setSuccessMsg(`Account established! Allocated tier: ${data.user.role}. Log in using your assigned credentials.`);
      
      // Clear inputs
      setRegFullName("");
      setRegUsername("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
      setRegConfirmPassword("");

      // Switch mode to login
      setTimeout(() => {
        setMode("login");
        setEmailOrUser(data.user.email);
        setSuccessMsg(null);
      }, 2500);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register profile.");
    }
  };

  // Pre-seed mock logins triggers to pre-fill inputs
  const fillQuickCredentials = (email: string) => {
    setEmailOrUser(email);
    setPassword("password");
    handleEmailInput(email);
    setSuccessMsg("Pre-filled credentials. Press Sign In below!");
  };

  // Google / Facebook Secure SSO: Render dialog bypass for standard sandbox iframe blocks
  const handleOAuthClick = (provider: "Google" | "Facebook") => {
    setSsoProvider(provider);
    setSsoEmail(provider === "Google" ? "sso.user@gmail.com" : "sso.user@facebook.com");
    setSsoName("SSO Enterprise Agent");
  };

  const handleOAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!ssoEmail.trim() || !ssoName.trim()) {
      alert("Please enter the SSO email and display name.");
      return;
    }

    try {
      const resp = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ssoEmail.trim(),
          fullName: ssoName.trim(),
          avatar: ssoAvatar,
          provider: ssoProvider
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed secure SSO validation.");
      }

      setSsoProvider(null);
      setRedirectedUser(data.user);
      setRedirecting(true);

      const route = data.user.role === UserRole.CEO 
        ? "/ceo/dashboard" 
        : data.user.role === UserRole.MANAGER 
          ? "/manager/dashboard" 
          : data.user.role === UserRole.ASSISTANT_MANAGER 
            ? "/assistant-manager/dashboard" 
            : "/agent/dashboard";
      
      setRedirectPath(route);

      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        setRedirecting(false);
      }, 1800);

    } catch (err: any) {
      setSsoProvider(null);
      setErrorMsg(err.message || "SSO validation encountered an issue. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-10 flex flex-col items-center justify-center p-4 relative z-50 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white" ref={containerRef}>
      
      {/* Background visual grid elements */}
      <div className="absolute inset-0 bg-[#070b12] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

      {/* Corporate platform credentials descriptor */}
      <div className="text-center mb-6 max-w-md space-y-2 relative z-10 animate-fade-in px-4">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-indigo-400 tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> ENTERPRISE COREGATE
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-display">
          Nexora OS
        </h1>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          Secure access to workforce management, communication, tasks, performance and productivity.
        </p>
      </div>

      {/* Interactive Yeti Screen Center Wrapper */}
      <div className="relative w-full max-w-[430px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 hover:border-indigo-500/20 transition-all duration-300">
        
        {/* SVG CONTAINER exactly matched to index.html */}
        <div className="svgContainer w-[200px] h-[200px] mx-auto mb-6 rounded-full relative overflow-hidden bg-[#a9ddf3] border-[2.5px] border-[#217093] pointer-events-none">
          <div className="relative w-full h-0 pb-[100%] rounded-full overflow-hidden">
            <svg className="mySVG absolute left-0 top-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200">
              <defs>
                <circle id="armMaskPath" cx="100" cy="100" r="100" />
              </defs>
              <clipPath id="armMask">
                <use xlinkHref="#armMaskPath" overflow="visible" />
              </clipPath>
              <circle cx="100" cy="100" r="100" fill="#a9ddf3" />
              <g className="body">
                {/* bodyBGchanged is shown when eyes are covered */}
                <path className="bodyBGchanged" style={{ display: eyesCovered ? "block" : "none" }} fill="#FFFFFF" d="M200,122h-35h-14.9V72c0-27.6-22.4-50-50-50s-50,22.4-50,50v50H35.8H0l0,91h200L200,122z" />
                <path className="bodyBGnormal" style={{ opacity: eyesCovered ? 0 : 1 }} stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#FFFFFF" d="M200,158.5c0-20.2-14.8-36.5-35-36.5h-14.9V72.8c0-27.4-21.7-50.4-49.1-50.8c-28-0.5-50.9,22.1-50.9,50v50 H35.8C16,122,0,138,0,157.8L0,213h200L200,158.5z" />
                <path fill="#DDF1FA" d="M100,156.4c-22.9,0-43,11.1-54.1,27.7c15.6,10,34.2,15.9,54.1,15.9s38.5-5.8,54.1-15.9 C143,167.5,122.9,156.4,100,156.4z" />
              </g>
              <g className="earL">
                <g className="outerEar" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5">
                  <circle cx="47" cy="83" r="11.5" />
                  <path d="M46.3 78.9c-2.3 0-4.1 1.9-4.1 4.1 0 2.3 1.9 4.1 4.1 4.1" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <g className="earHair">
                  <rect x="51" y="64" fill="#FFFFFF" width="15" height="35" />
                  <path d="M53.4 62.8C48.5 67.4 45 72.2 42.8 77c3.4-.1 6.8-.1 10.1.1-4 3.7-6.8 7.6-8.2 11.6 2.1 0 4.2 0 6.3.2-2.6 4.1-3.8 8.3-3.7 12.5 1.2-.7 3.4-1.4 5.2-1.9" fill="#fff" stroke="#3a5e77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
              <g className="earR">
                <g className="outerEar">
                  <circle fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" cx="153" cy="83" r="11.5" />
                  <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M153.7,78.9 c2.3,0,4.1,1.9,4.1,4.1c0,2.3-1.9,4.1-4.1,4.1" />
                </g>
                <g className="earHair">
                  <rect x="134" y="64" fill="#FFFFFF" width="15" height="35" />
                  <path fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M146.6,62.8 c4.9,4.6,8.4,9.4,10.6,14.2c-3.4-0.1-6.8-0.1-10.1,0.1c4,3.7,6.8,7.6,8.2,11.6c-2.1,0-4.2,0-6.3,0.2c2.6,4.1,3.8,8.3,3.7,12.5 c-1.2-0.7-3.4-1.4-5.2-1.9" />
                </g>
              </g>
              <path className="chin" d="M84.1 121.6c2.7 2.9 6.1 5.4 9.8 7.5l.9-4.5c2.9 2.5 6.3 4.8 10.2 6.5 0-1.9-.1-3.9-.2-5.8 3 1.2 6.2 2 9.7 2.5-.3-2.1-.7-4.1-1.2-6.1" fill="none" stroke="#3a5e77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path className="face" fill="#DDF1FA" d="M134.5,46v35.5c0,21.815-15.446,39.5-34.5,39.5s-34.5-17.685-34.5-39.5V46" />
              <path className="hair" fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M81.457,27.929 c1.755-4.084,5.51-8.262,11.253-11.77c0.979,2.565,1.883,5.14,2.712,7.723c3.162-4.265,8.626-8.27,16.272-11.235 c-0.737,3.293-1.588,6.573-2.554,9.837c4.857-2.116,11.049-3.64,18.428-4.156c-2.403,3.23-5.021,6.391-7.852,9.474" />
              <g className="eyebrow">
                <path fill="#FFFFFF" d="M138.142,55.064c-4.93,1.259-9.874,2.118-14.787,2.599c-0.336,3.341-0.776,6.689-1.322,10.037 c-4.569-1.465-8.909-3.222-12.996-5.226c-0.98,3.075-2.07,6.137-3.267,9.179c-5.514-3.067-10.559-6.545-15.097-10.329 c-1.806,2.889-3.745,5.73-5.816,8.515c-7.916-4.124-15.053-9.114-21.296-14.738l1.107-11.768h73.475V55.064z" />
                <path fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M63.56,55.102 c6.243,5.624,13.38,10.614,21.296,14.738c2.071-2.785,4.01-5.626,5.816-8.515c4.537,3.785,9.583,7.263,15.097,10.329 c1.197-3.043,2.287-6.104,3.267-9.179c4.087,2.004,8.427,3.761,12.996,5.226c0.545-3.348,0.986-6.696,1.322-10.037 c4.913-0.481,9.857-1.34,14.787-2.599" />
              </g>
              <g className="eyeL">
                <circle cx="85.5" cy="78.5" r="3.5" fill="#3a5e77" />
                <circle cx="84" cy="76" r="1" fill="#fff" />
              </g>
              <g className="eyeR">
                <circle cx="114.5" cy="78.5" r="3.5" fill="#3a5e77" />
                <circle cx="113" cy="76" r="1" fill="#fff" />
              </g>
              <g className="mouth">
                {/* Simulated mouth path background nodes */}
                <path className="mouthBG" fill="#617E92" d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z" />
                <path style={{ display: "none" }} className="mouthSmallBG" fill="#617E92" d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z" />
                <path style={{ display: "none" }} className="mouthMediumBG" d="M95,104.2c-4.5,0-8.2-3.7-8.2-8.2v-2c0-1.2,1-2.2,2.2-2.2h22c1.2,0,2.2,1,2.2,2.2v2 c0,4.5-3.7,8.2-8.2,8.2H95z" />
                <path style={{ display: "none" }} className="mouthLargeBG" d="M100 110.2c-9 0-16.2-7.3-16.2-16.2 0-2.3 1.9-4.2 4.2-4.2h24c2.3 0 4.2 1.9 4.2 4.2 0 9-7.2 16.2-16.2 16.2z" fill="#617e92" stroke="#3a5e77" strokeLinejoin="round" strokeWidth="2.5" />
                <defs>
                  <path id="mouthMaskPath" d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z" />
                </defs>
                <clipPath id="mouthMask">
                  <use xlinkHref="#mouthMaskPath" overflow="visible" />
                </clipPath>
                <g clipPath="url(#mouthMask)">
                  <g className="tongue">
                    <circle cx="100" cy="107" r="8" fill="#cc4a6c" />
                    <ellipse className="tongueHighlight" cx="100" cy="100.5" rx="3" ry="1.5" opacity=".1" fill="#fff" />
                  </g>
                </g>
                <path clipPath="url(#mouthMask)" className="tooth" style={{ fill: "#FFFFFF" }} d="M106,97h-4c-1.1,0-2-0.9-2-2v-2h8v2C108,96.1,107.1,97,106,97z" />
                <path className="mouthOutline" fill="none" stroke="#3A5E77" strokeWidth="2.5" strokeLinejoin="round" d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z" />
              </g>
              <path className="nose" d="M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z" fill="#3a5e77" />
              <g className="arms" clipPath="url(#armMask)">
                <g className="armL" style={{ visibility: "hidden" }}>
                  <polygon fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" points="121.3,98.4 111,59.7 149.8,49.3 169.8,85.4" />
                  <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M134.4,53.5l19.3-5.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-10.3,2.8" />
                  <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M150.9,59.4l26-7c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-21.3,5.7" />

                  <g className="twoFingers">
                    <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M158.3,67.8l23.1-6.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-23.1,6.2" />
                    <path fill="#A9DDF3" d="M180.1,65l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L180.1,65z" />
                    <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M160.8,77.5l19.4-5.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-18.3,4.9" />
                    <path fill="#A9DDF3" d="M178.8,75.7l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L178.8,75.7z" />
                  </g>
                  <path fill="#A9DDF3" d="M175.5,55.9l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L175.5,55.9z" />
                  <path fill="#A9DDF3" d="M152.1,50.4l2.2-0.6c1.1-0.3,2.2,0.3,2.4,1.4v0c0.3,1.1-0.3,2.2-1.4,2.4l-2.2,0.6L152.1,50.4z" />
                  <path fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M123.5,97.8 c-41.4,14.9-84.1,30.7-108.2,35.5L1.2,81c33.5-9.9,71.9-16.5,111.9-21.8" />
                  <path fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M108.5,60.4 c7.7-5.3,14.3-8.4,22.8-13.2c-2.4,5.3-4.7,10.3-6.7,15.1c4.3,0.3,8.4,0.7,12.3,1.3c-4.2,5-8.1,9.6-11.5,13.9 c3.1,1.1,6,2.4,8.7,3.8c-1.4,2.9-2.7,5.8-3.9,8.5c2.5,3.5,4.6,7.2,6.3,11c-4.9-0.8-9-0.7-16.2-2.7" />
                  <path fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M94.5,103.8 c-0.6,4-3.8,8.9-9.4,14.7c-2.6-1.8-5-3.7-7.2-5.7c-2.5,4.1-6.6,8.8-12.2,14c-1.9-2.2-3.4-4.5-4.5-6.9c-4.4,3.3-9.5,6.9-15.4,10.8 c-0.2-3.4,0.1-7.1,1.1-10.9" />
                  <path fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M97.5,63.9 c-1.7-2.4-5.9-4.1-12.4-5.2c-0.9,2.2-1.8,4.3-2.5,6.5c-3.8-1.8-9.4-3.1-17-3.8c0.5,2.3,1.2,4.5,1.9,6.8c-5-0.6-11.2-0.9-18.4-1 c2,2.9,0.9,3.5,3.9,6.2" />
                </g>
                <g className="armR" style={{ visibility: "hidden" }}>
                  <path fill="#ddf1fa" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2.5" d="M265.4 97.3l10.4-38.6-38.9-10.5-20 36.1z" />
                  <path fill="#ddf1fa" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2.5" d="M252.4 52.4L233 47.2c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l10.3 2.8M226 76.4l-19.4-5.2c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l18.3 4.9M228.4 66.7l-23.1-6.2c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l23.1 6.2M235.8 58.3l-26-7c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l21.3 5.7" />
                  <path fill="#a9ddf3" d="M207.9 74.7l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8zM206.7 64l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8zM211.2 54.8l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8zM234.6 49.4l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8z" />
                  <path fill="#fff" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M263.3 96.7c41.4 14.9 84.1 30.7 108.2 35.5l14-52.3C352 70 313.6 63.5 273.6 58.1" />
                  <path fill="#fff" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M278.2 59.3l-18.6-10 2.5 11.9-10.7 6.5 9.9 8.7-13.9 6.4 9.1 5.9-13.2 9.2 23.1-.9M284.5 100.1c-.4 4 1.8 8.9 6.7 14.8 3.5-1.8 6.7-3.6 9.7-5.5 1.8 4.2 5.1 8.9 10.1 14.1 2.7-2.1 5.1-4.4 7.1-6.8 4.1 3.4 9 7 14.7 11 1.2-3.4 1.8-7 1.7-10.9M314 66.7s5.4-5.7 12.6-7.4c1.7 2.9 3.3 5.7 4.9 8.6 3.8-2.5 9.8-4.4 18.2-5.7.1 3.1.1 6.1 0 9.2 5.5-1 12.5-1.6 20.8-1.9-1.4 3.9-2.5 8.4-2.5 8.4" />
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {errorMsg && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2.5 text-xs text-rose-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-2.5 text-xs text-emerald-400 font-medium">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-300" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" /> Email or Username
              </label>
              <input
                ref={emailInputRef}
                type="text"
                required
                value={emailOrUser}
                onChange={(e) => {
                  setEmailOrUser(e.target.value);
                  handleEmailInput(e.target.value);
                }}
                onClick={() => {
                  handleEmailInput(emailOrUser);
                }}
                onKeyUp={(e) => {
                  if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home" || e.key === "End") {
                    handleEmailInput(emailOrUser);
                  }
                }}
                onFocus={() => {
                  activeElementRef.current = "email";
                  handleEmailInput(emailOrUser);
                }}
                onBlur={() => {
                  activeElementRef.current = null;
                  setTimeout(() => {
                    if (activeElementRef.current !== "email") {
                      resetFace();
                    }
                  }, 120);
                }}
                placeholder="CEO: ceo@nexora.com"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px] transition-all"
              />
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Password
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded bg-slate-950 border-white/10 text-indigo-500 focus:ring-0 w-3 h-3"
                  />
                  Show
                </label>
              </div>
              <input
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => {
                  activeElementRef.current = "password";
                  coverEyes();
                }}
                onBlur={() => {
                  activeElementRef.current = null;
                  setTimeout(() => {
                    if (activeElementRef.current !== "password") {
                      uncoverEyes();
                    }
                  }, 120);
                }}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px] transition-all font-mono"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-white/10 text-indigo-500 focus:ring-0 w-3.5 h-3.5"
                />
                Remember Me
              </label>

              <button
                type="button"
                onClick={() => alert("Please consult your administrator Alex Nexora or use 'ceo@nexora.com' password: 'password' to override.")}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <LogIn className="w-4 h-4" /> Sign In To Portal
            </button>
          </form>
        )}

        {/* REGISTER MODE */}
        {mode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[440px] overflow-y-auto pr-1 no-scrollbar">
            
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 text-[11px] leading-snug text-indigo-300/90 font-mono">
              {users.length === 0 ? (
                <span className="text-amber-400 font-bold block mb-0.5">⚠️ zero users detected</span>
              ) : null}
              The first registered account automatically becomes **CEO**. All subsequent profile creations allocate the default **Agent** tier.
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                Full name
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Alex Carter"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="alex.c"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+1 (555) 000-000"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                Email address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alex.carter@nexora.com"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                  Security Code
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                Choose Portrait Avatar
              </label>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-1">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRegAvatar(url)}
                    className={`relative rounded-full shrink-0 outline-none w-10 h-10 border transition-all ${
                      regAvatar === url ? "border-indigo-400 ring-2 ring-indigo-500" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="w-full h-full rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Plus className="w-4 h-4" /> Create Profile
            </button>
          </form>
        )}

        {/* Mode Toggle footer */}
        <div className="text-center mt-6 pt-4 border-t border-white/5 text-xs text-slate-400">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 cursor-pointer"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an enterprise key?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Secure SSO Social Multi-Providers Layout */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Or continue with
          </p>
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <button
              type="button"
              onClick={() => handleOAuthClick("Google")}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-white/5 hover:border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer min-h-[44px]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuthClick("Facebook")}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-white/5 hover:border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer min-h-[44px]"
            >
              <svg className="w-4 h-4 fill-current shrink-0 text-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>
        </div>

      </div>

      {/* Database control utilities footer for simplified verification testing */}
      <div className="mt-8 flex gap-4 text-[11px] font-mono text-slate-500 animate-fade-in justify-center flex-wrap select-none relative z-10 bg-slate-950/40 p-3 rounded-xl border border-white/5">
        <span className="font-bold text-white uppercase tracking-widest leading-none mt-1">Pre-filled Access:</span>
        <button
          onClick={() => fillQuickCredentials("ceo@nexora.com")}
          className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
        >
          ceo [alex]
        </button>
        <span>•</span>
        <button
          onClick={() => fillQuickCredentials("sarah.m@nexora.com")}
          className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
        >
          manager [sarah]
        </button>
        <span>•</span>
        <button
          onClick={() => fillQuickCredentials("elena.r@nexora.com")}
          className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
        >
          assist [elena]
        </button>
        <span>•</span>
        <button
          onClick={() => fillQuickCredentials("marcus.c@nexora.com")}
          className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
        >
          agent [marcus]
        </button>
        <span>•</span>
        <button
          onClick={async () => {
            if (confirm("Are you sure you want to delete all profiles in the database? This lets you test the Zero-Users CEO creation flow!")) {
              try {
                await fetch("/api/auth/reset", { method: "POST" });
                onResetDatabase();
                setErrorMsg(null);
                setSuccessMsg("Database cleaned. The very next user registered will automatically become CEO!");
              } catch (err) {
                console.error("Failed to clean database", err);
              }
            }
          }}
          className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" /> Clean DB (Zero-Users Flow)
        </button>
      </div>

      <div className="mt-4 text-[10px] font-mono text-slate-600 select-none">
        Nexora Enterprise OS Core Gate • Decentered 256-bit Secure Layer
      </div>

      {/* SANDBOXED SECURE SSO POPUP */}
      {ssoProvider && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSsoProvider(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ×
            </button>
            <div className="text-center space-y-1">
              <div className="inline-flex p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Authorize {ssoProvider} SSO Link
              </h3>
              <p className="text-[11px] text-slate-400">
                Provide secure credentials to link your physical {ssoProvider} Identity into Nexora core DB.
              </p>
            </div>

            <form onSubmit={handleOAuthSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                  Select Profile Portrait
                </label>
                <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSsoAvatar(url)}
                      className={`relative rounded-full shrink-0 outline-none w-8 h-8 border transition-all ${
                        ssoAvatar === url ? "border-indigo-400 ring-2 ring-indigo-500" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={ssoName}
                  onChange={(e) => setSsoName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={ssoEmail}
                  onChange={(e) => setSsoEmail(e.target.value)}
                  placeholder="john.doe@gmail.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                Authenticate & Access Workspace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULL SCREEN DYNAMIC REDIRECTION OVERLAY */}
      {redirecting && redirectedUser && (
        <div className="fixed inset-0 bg-slate-950 z-100 flex flex-col items-center justify-center animate-fade-in p-6">
          <div className="space-y-6 text-center max-w-sm">
            <div className="relative inline-block">
              <img src={redirectedUser.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-xl" />
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1.5 border border-slate-950">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Authenticating Credentials...
              </h2>
              <p className="text-xs text-indigo-300 font-mono uppercase bg-indigo-500/10 px-3 py-1 rounded-full inline-block">
                Allocated Route: {redirectPath}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Redirecting {redirectedUser.fullName} to the specialized {redirectedUser.role} Portal. Please wait...
              </p>
            </div>

            {/* Simulated terminal loader */}
            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-left font-mono text-[10px] text-slate-500 space-y-1 block">
              <p className="text-emerald-400">✓ Token verified successfully</p>
              <p className="text-indigo-400">✓ Authorization: {redirectedUser.role}</p>
              <p className="animate-pulse">▶ Launching secure container link...</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
