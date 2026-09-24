/**
 * PROXY HUD ENGINE // Muhammad Yazid Hashyidan
 * Comprehensive Cyberpunk Terminal, Web Audio Synthesizer, EXP Gamification & Canvas Nodes
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (ZERO-DEPENDENCY PROCEDURAL AUDIO)
  // =========================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.sfxEnabled = true;
      this.bgmPlaying = false;
      this.bgmOscillators = [];
      this.bgmGain = null;
    }

    initCtx() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    playTone(freq, type = "sine", duration = 0.08, gainVal = 0.08) {
      if (!this.sfxEnabled) return;
      this.initCtx();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // audio error fallback
      }
    }

    playClick() {
      this.playTone(880, "square", 0.03, 0.04);
    }

    playKeyClick() {
      this.playTone(1200 + Math.random() * 400, "triangle", 0.02, 0.025);
    }

    playWhoosh() {
      if (!this.sfxEnabled) return;
      this.initCtx();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
      } catch (e) {}
    }

    playCoin() {
      if (!this.sfxEnabled) return;
      this.playTone(987.77, "sine", 0.1, 0.08);
      setTimeout(() => this.playTone(1318.51, "sine", 0.22, 0.08), 80);
    }

    playLevelUp() {
      if (!this.sfxEnabled) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, "triangle", 0.2, 0.1), idx * 90);
      });
    }

    toggleBgm() {
      this.initCtx();
      if (!this.ctx) return false;

      if (this.bgmPlaying) {
        this.stopBgm();
        return false;
      } else {
        this.startBgm();
        return true;
      }
    }

    startBgm() {
      if (!this.ctx) return;
      this.stopBgm();

      const chords = [130.81, 196.0, 261.63, 392.0]; // C - G - C - G ambient chord
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.035, this.ctx.currentTime);

      // Lowpass filter for smooth cyber atmosphere
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.bgmGain.connect(filter);
      filter.connect(this.ctx.destination);

      this.bgmOscillators = chords.map((freq) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.connect(this.bgmGain);
        osc.start();
        return osc;
      });

      this.bgmPlaying = true;
    }

    stopBgm() {
      if (this.bgmOscillators) {
        this.bgmOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {}
        });
        this.bgmOscillators = [];
      }
      this.bgmPlaying = false;
    }
  }

  const sound = new SoundEngine();

  // Safe Storage Wrapper (handles private browsing / blocked cookies)
  const memoryStore = {};
  function safeGetStorage(key, fallback = "") {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key) ?? fallback;
      }
    } catch (e) {}
    return memoryStore[key] ?? fallback;
  }

  function safeSetStorage(key, value) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (e) {}
    memoryStore[key] = value;
  }

  // =========================================================================
  // 2. EXP & GAMIFICATION ENGINE
  // =========================================================================
  class ExpManager {
    constructor() {
      this.expKey = "proxy_agent_exp";
      this.claimedMissionsKey = "proxy_claimed_missions";
      this.exp = parseInt(safeGetStorage(this.expKey, "0"), 10);
      try {
        this.claimedMissions = JSON.parse(safeGetStorage(this.claimedMissionsKey, "[]"));
      } catch (e) {
        this.claimedMissions = [];
      }

      this.updateHud();
    }

    getRank(exp) {
      if (exp >= 10000) return { level: 3, title: "★ S-RANK PROXY", max: 15000 };
      if (exp >= 5000) return { level: 2, title: "INVESTIGATOR", max: 10000 };
      if (exp >= 2000) return { level: 1, title: "ENFORCER", max: 5000 };
      return { level: 0, title: "ROOKIE", max: 2000 };
    }

    addExp(amount, reason = "Discovered Intel") {
      const oldRank = this.getRank(this.exp);
      this.exp += amount;
      safeSetStorage(this.expKey, this.exp.toString());

      const newRank = this.getRank(this.exp);
      this.updateHud();

      sound.playCoin();
      showToast(`+${amount} EXP: ${reason}`);

      if (newRank.level > oldRank.level) {
        sound.playLevelUp();
        setTimeout(() => {
          showToast(`⚡ RANK UP! PROMOTED TO ${newRank.title}!`);
        }, 500);
      }
    }

    updateHud() {
      const rank = this.getRank(this.exp);
      const hudExp = document.getElementById("hudExpVal");
      const hudLevel = document.getElementById("hudLevelVal");
      const hudBar = document.getElementById("hudExpBar");
      const heroLevel = document.getElementById("heroLevelDisplay");

      const percentage = Math.min(100, Math.round((this.exp / rank.max) * 100));

      if (hudExp) hudExp.textContent = `${this.exp} EXP`;
      if (hudLevel) hudLevel.textContent = `LVL ${rank.level}`;
      if (hudBar) hudBar.style.width = `${percentage}%`;
      if (heroLevel) heroLevel.textContent = `LVL ${rank.level}`;
    }

    hasClaimed(missionId) {
      return this.claimedMissions.includes(missionId);
    }

    claimMission(missionId, amount, name) {
      if (this.hasClaimed(missionId)) return false;
      this.claimedMissions.push(missionId);
      safeSetStorage(
        this.claimedMissionsKey,
        JSON.stringify(this.claimedMissions),
      );
      this.addExp(amount, `Commission ${missionId} (${name})`);
      return true;
    }
  }

  const expSystem = new ExpManager();

  // Toast System
  function showToast(text) {
    let container = document.getElementById("hudToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "hudToastContainer";
      container.className = "hud-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "hud-toast text-zzz-yellow font-teko text-xl";
    toast.innerHTML = `
      <img src="media/shinygoldcoin.gif" alt="EXP" class="w-5 h-5 object-contain" />
      <span>${text}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateX(40px)";
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // =========================================================================
  // 3. REACTIVE CYBER CANVAS DATA NODES
  // =========================================================================
  const canvas = document.getElementById("cyber-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const mouse = { x: -1000, y: -1000 };
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const nodes = [];
    const nodeCount = Math.min(38, Math.floor(window.innerWidth / 35));

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2.5 + 1,
      });
    }

    function animateNodes() {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.lineWidth = 0.75;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy;

        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        // Draw dot
        ctx.fillStyle = "rgba(247, 224, 24, 0.45)";
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, n1.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect with nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < 110) {
            ctx.strokeStyle = `rgba(247, 224, 24, ${0.2 * (1 - dist / 110)})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Connect with mouse
        const mDist = Math.hypot(n1.x - mouse.x, n1.y - mouse.y);
        if (mDist < 140) {
          ctx.strokeStyle = `rgba(247, 224, 24, ${0.45 * (1 - mDist / 140)})`;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      requestAnimationFrame(animateNodes);
    }

    animateNodes();
  }

  // =========================================================================
  // 4. FLOATING BGM VINYL PLAYER
  // =========================================================================
  const vinylWidget = document.getElementById("vinylWidget");
  const vinylDisc = document.getElementById("vinylDisc");
  const vinylStatus = document.getElementById("vinylStatus");

  if (vinylWidget && vinylDisc) {
    vinylWidget.addEventListener("click", () => {
      sound.playClick();
      const isPlaying = sound.toggleBgm();
      if (isPlaying) {
        vinylDisc.classList.add("spinning");
        if (vinylStatus) vinylStatus.textContent = "PLAYING AMBIENT";
        showToast("🎵 Cyber Ambient BGM: ACTIVE");
      } else {
        vinylDisc.classList.remove("spinning");
        if (vinylStatus) vinylStatus.textContent = "BGM OFF";
        showToast("🔇 Ambient BGM: MUTED");
      }
    });
  }

  // =========================================================================
  // 5. INTERACTIVE TERMINAL CLI DRAWER
  // =========================================================================
  const terminalModal = document.getElementById("terminalModal");
  const terminalLogs = document.getElementById("terminalLogs");
  const terminalInput = document.getElementById("terminalInput");
  const openTerminalBtns = document.querySelectorAll(".open-terminal-btn");
  const closeTerminalBtn = document.getElementById("closeTerminalBtn");

  function openTerminal() {
    if (!terminalModal) return;
    sound.playWhoosh();
    terminalModal.classList.add("active");
    terminalModal.setAttribute("aria-hidden", "false");
    setTimeout(() => terminalInput?.focus(), 100);
    expSystem.addExp(50, "Accessed CLI Terminal");
  }

  function closeTerminal() {
    if (!terminalModal) return;
    sound.playWhoosh();
    terminalModal.classList.remove("active");
    terminalModal.setAttribute("aria-hidden", "true");
  }

  openTerminalBtns.forEach((btn) => btn.addEventListener("click", openTerminal));
  if (closeTerminalBtn) closeTerminalBtn.addEventListener("click", closeTerminal);

  if (terminalModal) {
    terminalModal.addEventListener("click", (e) => {
      if (e.target === terminalModal) closeTerminal();
    });
  }

  // Keyboard Shortcut: press '~' or '`' to open terminal
  document.addEventListener("keydown", (e) => {
    if (!e) return;
    if (e.key === "`" || e.key === "~") {
      e.preventDefault();
      if (terminalModal && terminalModal.classList.contains("active")) {
        closeTerminal();
      } else {
        openTerminal();
      }
    } else if (e.key === "Escape") {
      closeTerminal();
      closeBriefingModal();
    }
  });

  // Terminal Command Logic
  function logToTerminal(text, color = "text-gray-300") {
    if (!terminalLogs) return;
    const line = document.createElement("div");
    line.className = `py-0.5 leading-relaxed ${color}`;
    line.innerHTML = text;
    terminalLogs.appendChild(line);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  if (terminalInput) {
    terminalInput.addEventListener("keydown", (e) => {
      sound.playKeyClick();
      if (e.key === "Enter") {
        const cmd = terminalInput.value.trim().toLowerCase();
        terminalInput.value = "";

        logToTerminal(`<span class="text-zzz-yellow">PROXY@HOLLOW:~$</span> ${cmd}`);

        if (!cmd) return;

        expSystem.addExp(25, "Command Executed");

        switch (cmd) {
          case "help":
            logToTerminal("AVAILABLE COMMANDS:", "text-zzz-yellow font-bold");
            logToTerminal("  <span class='text-white'>help</span>      - Show list of terminal commands");
            logToTerminal("  <span class='text-white'>skills</span>    - Inspect S-Rank Skill Discs");
            logToTerminal("  <span class='text-white'>quests</span>    - View active commissions & status");
            logToTerminal("  <span class='text-white'>open 089</span>  - Open PenaAksara mission dossier");
            logToTerminal("  <span class='text-white'>open 042</span>  - Launch Minecraft Bedrock profile");
            logToTerminal("  <span class='text-white'>exp</span>       - Display current agent rank and EXP");
            logToTerminal("  <span class='text-white'>contact</span>   - Show communication frequencies");
            logToTerminal("  <span class='text-white'>bgm</span>       - Toggle ambient audio synthesizer");
            logToTerminal("  <span class='text-white'>clear</span>     - Clear terminal history");
            logToTerminal("  <span class='text-white'>secret</span>    - Query encrypted Hollow intelligence");
            break;

          case "skills":
            logToTerminal("AGENT SKILL DISCS:", "text-zzz-yellow font-bold");
            logToTerminal("  [01] React / Next.js (ADV) - SSR & Reactive Architecture");
            logToTerminal("  [02] Design & CSS Anim (ADV) - HUD Styling & Micro-interactions");
            logToTerminal("  [03] Three.js / WebGL (MID) - Interactive 3D & Shaders");
            logToTerminal("  [04] Product Manager (ADV) - Agile Workflows & Planning");
            break;

          case "quests":
          case "projects":
            logToTerminal("COMMISSION LOGS:", "text-zzz-yellow font-bold");
            logToTerminal("  #089: PROJECT_WRITING_PLATFORM (PenaAksara) -> Type 'open 089'");
            logToTerminal("  #042: PROJECT_GAMECARD_PROFILE (MinecraftBedrock) -> Type 'open 042'");
            break;

          case "open 089":
            openBriefingModal();
            logToTerminal("Decrypting Commission #089 Dossier...", "text-green-400");
            break;

          case "open 042":
            logToTerminal("Launching Minecraft Profile...", "text-green-400");
            setTimeout(() => {
              window.location.href = "project/Ujian%20B2/profil.html";
            }, 600);
            break;

          case "exp":
          case "rank":
            const r = expSystem.getRank(expSystem.exp);
            logToTerminal(`CURRENT EXP: ${expSystem.exp} EXP`, "text-zzz-yellow");
            logToTerminal(`RANK: ${r.title} (LVL ${r.level})`, "text-white");
            logToTerminal(`PROGRESS TO NEXT RANK: ${expSystem.exp} / ${r.max}`, "text-gray-400");
            break;

          case "contact":
            logToTerminal("COMMS FREQUENCIES:", "text-zzz-yellow font-bold");
            logToTerminal("  WhatsApp: +62 813-1772-0178");
            logToTerminal("  GitHub: https://github.com/hashyidan-gif");
            break;

          case "bgm":
          case "music":
            const active = sound.toggleBgm();
            if (active) {
              vinylDisc?.classList.add("spinning");
              if (vinylStatus) vinylStatus.textContent = "PLAYING AMBIENT";
              logToTerminal("Procedural Ambient BGM: ENGAGED", "text-green-400");
            } else {
              vinylDisc?.classList.remove("spinning");
              if (vinylStatus) vinylStatus.textContent = "BGM OFF";
              logToTerminal("Procedural Ambient BGM: TERMINATED", "text-red-400");
            }
            break;

          case "clear":
            terminalLogs.innerHTML = "";
            logToTerminal("TERMINAL LOGS PURGED.", "text-gray-500");
            break;

          case "secret":
            sound.playLevelUp();
            expSystem.addExp(1000, "Decrypted Hidden Hollow Secret");
            logToTerminal("⚡ [ACCESS GRANTED]: HOLLOW CODE DECRYPTED!", "text-yellow-400 font-bold");
            logToTerminal("You have unraveled the core protocol. +1000 BONUS EXP AWARDED!", "text-white");
            break;

          default:
            logToTerminal(`command not recognized: '${cmd}'. Type 'help' for instructions.`, "text-red-400");
        }
      }
    });
  }

  // =========================================================================
  // 6. HOLOGRAPHIC MISSION BRIEFING MODAL (COMMISSION #089 PENAAKSARA)
  // =========================================================================
  const briefingModal = document.getElementById("briefingModal");
  const openBriefingBtns = document.querySelectorAll(".open-briefing-btn");
  const closeBriefingBtn = document.getElementById("closeBriefingBtn");
  const claimMissionExpBtn = document.getElementById("claimMissionExpBtn");

  function openBriefingModal() {
    if (!briefingModal) return;
    sound.playWhoosh();
    briefingModal.classList.add("active");
    briefingModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Update claim button state
    if (claimMissionExpBtn) {
      if (expSystem.hasClaimed("089")) {
        claimMissionExpBtn.textContent = "✓ EXP CLAIMED (+5000)";
        claimMissionExpBtn.classList.add("opacity-50", "cursor-not-allowed");
      } else {
        claimMissionExpBtn.textContent = "CLAIM EXP +5000 ★";
        claimMissionExpBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    }
  }

  function closeBriefingModal() {
    if (!briefingModal) return;
    sound.playWhoosh();
    briefingModal.classList.remove("active");
    briefingModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openBriefingBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sound.playClick();
      openBriefingModal();
    });
  });

  if (closeBriefingBtn) {
    closeBriefingBtn.addEventListener("click", () => {
      sound.playClick();
      closeBriefingModal();
    });
  }

  if (briefingModal) {
    briefingModal.addEventListener("click", (e) => {
      if (e.target === briefingModal) {
        closeBriefingModal();
      }
    });
  }

  if (claimMissionExpBtn) {
    claimMissionExpBtn.addEventListener("click", () => {
      if (expSystem.hasClaimed("089")) {
        showToast("Commission #089 EXP already claimed!");
      } else {
        expSystem.claimMission("089", 5000, "PenaAksara Platform");
        claimMissionExpBtn.textContent = "✓ EXP CLAIMED (+5000)";
        claimMissionExpBtn.classList.add("opacity-50", "cursor-not-allowed");
      }
    });
  }

  // =========================================================================
  // 7. INTERACTIVE SKILL CARDS EXP DISCOVERY
  // =========================================================================
  const skillCards = document.querySelectorAll(".skill-card");
  skillCards.forEach((card, idx) => {
    card.addEventListener("click", () => {
      sound.playClick();
      const discTitle = card.querySelector("h3")?.textContent || `Disc #${idx + 1}`;
      expSystem.addExp(250, `Intel: ${discTitle}`);
    });
  });

  // =========================================================================
  // 8. ENTRANCE GSAP ANIMATIONS & TYPEWRITER
  // =========================================================================
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    const heroSection = document.getElementById("hero");

    if (window.gsap && heroSection) {
      window.gsap.from("#hero h1", {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power4.out",
      });

      window.gsap.from("#typewriter", {
        duration: 1,
        y: 20,
        opacity: 0,
        delay: 0.25,
        ease: "power3.out",
      });

      const cards = document.querySelectorAll(".zzz-card");
      if (cards.length > 0) {
        window.gsap.from(cards, {
          duration: 0.8,
          y: 40,
          opacity: 0,
          stagger: 0.08,
          delay: 0.4,
          ease: "power2.out",
        });
      }
    }
  }

  // Typewriter effect (guarded for pages with #typewriter)
  const typewriterElement = document.getElementById("typewriter");
  if (typewriterElement) {
    const text =
      "Specializing in building high-performance interactive web apps, spatial experiences, and Hollow exploration interfaces.";
    let charIndex = 0;
    const speed = 12;

    typewriterElement.textContent = "";

    function typeWriter() {
      if (charIndex < text.length) {
        typewriterElement.textContent = text.slice(0, charIndex + 1);
        charIndex++;
        setTimeout(typeWriter, speed);
      }
    }

    setTimeout(typeWriter, 350);
  }
});
