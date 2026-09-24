const body = document.body;
const modeToggle = document.getElementById("modeToggle");
const timeDisplay = document.getElementById("serverTime");
const addFriendBtn = document.getElementById("addFriendBtn");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const friendModal = document.getElementById("friendModal");
const closeFriendModal = document.querySelector(".friend-modal__close");
const luluBtn = document.getElementById("lulu");
let audioPlayer = new Audio(
  "Media/Mrs. GREEN APPLE「lulu.」Official Music Video_1778804976671.mp3.mpeg",
);

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

function updateModeBasedOnTime(now) {
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

updateTime();
setInterval(updateTime, 1000);

if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    const creative = body.classList.toggle("creative-mode");
    modeToggle.textContent = creative ? "Survival Mode" : "Creative Mode";
  });
}

if (addFriendBtn && friendModal) {
  addFriendBtn.addEventListener("click", () => {
    friendModal.classList.remove("hidden");
    friendModal.setAttribute("aria-hidden", "false");
  });
}

if (sendMessageBtn) {
  sendMessageBtn.addEventListener("click", () => {
    const phoneNumber = "6281317720178";
    const message = encodeURIComponent(
      "Hai, saya tertarik dengan profil Anda.",
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  });
}

if (luluBtn) {
  luluBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      luluBtn.textContent = "⏸ lulu";
    } else {
      audioPlayer.pause();
      luluBtn.textContent = "lulu";
    }
  });

  audioPlayer.addEventListener("ended", () => {
    luluBtn.textContent = "lulu";
  });
}

if (closeFriendModal && friendModal) {
  closeFriendModal.addEventListener("click", () => {
    friendModal.classList.add("hidden");
    friendModal.setAttribute("aria-hidden", "true");
  });
}

if (friendModal) {
  friendModal.addEventListener("click", (event) => {
    if (event.target === friendModal) {
      friendModal.classList.add("hidden");
      friendModal.setAttribute("aria-hidden", "true");
    }
  });
}

function spawnPixelBurst() {
  const particle = document.createElement("span");
  particle.className = "pixel-particle";

  const size = 10 + Math.random() * 18;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${Math.random() * window.innerWidth}px`;
  particle.style.top = `${window.innerHeight - 80}px`;

  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 1600);
}

setInterval(spawnPixelBurst, 1400);
