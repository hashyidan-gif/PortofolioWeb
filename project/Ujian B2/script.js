document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const modeToggle = document.getElementById("modeToggle");
  const timeDisplay = document.getElementById("serverTime");
  const addFriendBtn = document.getElementById("addFriendBtn");
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  const friendModal = document.getElementById("friendModal");
  const closeFriendModal = document.querySelector(".friend-modal__close");
  const luluBtn = document.getElementById("lulu");

  let userOverrodeMode = false;

  // Restore session preference if available
  const savedMode = sessionStorage.getItem("mc_profile_mode");
  if (savedMode !== null) {
    userOverrodeMode = true;
    if (savedMode === "creative") {
      body.classList.add("creative-mode");
      if (modeToggle) modeToggle.textContent = "Survival Mode";
    } else {
      body.classList.remove("creative-mode");
      if (modeToggle) modeToggle.textContent = "Creative Mode";
    }
  }

  function updateModeBasedOnTime(now) {
    if (userOverrodeMode) return;

    const hour = now.getHours();
    const isCreativeHour = hour % 2 === 0;
    const isCreativeMode = body.classList.contains("creative-mode");

    if (isCreativeHour && !isCreativeMode) {
      body.classList.add("creative-mode");
      if (modeToggle) modeToggle.textContent = "Survival Mode";
    } else if (!isCreativeHour && isCreativeMode) {
      body.classList.remove("creative-mode");
      if (modeToggle) modeToggle.textContent = "Creative Mode";
    }
  }

  function updateTime() {
    const now = new Date();
    const time = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);

    if (timeDisplay) {
      timeDisplay.textContent = time;
    }

    updateModeBasedOnTime(now);
  }

  updateTime();
  setInterval(updateTime, 1000);

  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      userOverrodeMode = true;
      const isCreative = body.classList.toggle("creative-mode");
      modeToggle.textContent = isCreative ? "Survival Mode" : "Creative Mode";
      sessionStorage.setItem("mc_profile_mode", isCreative ? "creative" : "survival");
    });
  }

  // Modal Dialog Handlers
  function openModal() {
    if (!friendModal) return;
    friendModal.classList.remove("hidden");
    friendModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeFriendModal?.focus();
  }

  function closeModal() {
    if (!friendModal) return;
    friendModal.classList.add("hidden");
    friendModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    addFriendBtn?.focus();
  }

  if (addFriendBtn) {
    addFriendBtn.addEventListener("click", openModal);
  }

  if (closeFriendModal) {
    closeFriendModal.addEventListener("click", closeModal);
  }

  if (friendModal) {
    friendModal.addEventListener("click", (event) => {
      if (event.target === friendModal) {
        closeModal();
      }
    });
  }

  // Keyboard accessibility: Close modal on Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && friendModal && !friendModal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // Direct WhatsApp Messaging
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener("click", () => {
      const phoneNumber = "6281317720178";
      const message = encodeURIComponent(
        "Hai Muhammad Yazid, saya tertarik dengan portofolio profil Anda!",
      );
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank", "noopener,noreferrer");
    });
  }

  // Audio Player Handling (Lazy initialization with Promise error handling)
  let audioPlayer = null;

  function getAudioPlayer() {
    if (!audioPlayer) {
      audioPlayer = new Audio("Media/lulu_theme.mp3");
      audioPlayer.addEventListener("ended", () => {
        if (luluBtn) luluBtn.textContent = "🎵 BGM";
      });
      audioPlayer.addEventListener("error", (e) => {
        console.warn("Audio file error or codec unsupported:", e);
        if (luluBtn) luluBtn.textContent = "🎵 BGM";
      });
    }
    return audioPlayer;
  }

  if (luluBtn) {
    luluBtn.addEventListener("click", () => {
      const player = getAudioPlayer();
      if (player.paused) {
        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              luluBtn.textContent = "⏸ Pause";
            })
            .catch((err) => {
              console.warn("Audio play prevented:", err);
              luluBtn.textContent = "🎵 BGM";
            });
        }
      } else {
        player.pause();
        luluBtn.textContent = "🎵 BGM";
      }
    });
  }

  // Pixel particle burst animation with concurrency cap
  let activeParticleCount = 0;
  const MAX_PARTICLES = 12;

  function spawnPixelBurst() {
    if (document.hidden || activeParticleCount >= MAX_PARTICLES) return;

    const particle = document.createElement("span");
    particle.className = "pixel-particle";

    const size = 8 + Math.random() * 14;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
    particle.style.bottom = `${20 + Math.random() * 60}px`;

    document.body.appendChild(particle);
    activeParticleCount++;

    setTimeout(() => {
      particle.remove();
      activeParticleCount = Math.max(0, activeParticleCount - 1);
    }, 1600);
  }

  setInterval(spawnPixelBurst, 1200);
});
