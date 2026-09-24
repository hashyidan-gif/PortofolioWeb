(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    return;
  }

  const animateWithGsap = () => {
    if (!window.gsap) {
      return false;
    }

    window.gsap.from("#hero h1", {
      duration: 1,
      y: 50,
      opacity: 0,
      ease: "power4.out",
    });
    window.gsap.from("#hero p", {
      duration: 1,
      y: 30,
      opacity: 0,
      delay: 0.3,
      ease: "power3.out",
    });
    window.gsap.from(".zzz-card", {
      duration: 0.8,
      y: 40,
      opacity: 0,
      stagger: 0.1,
      delay: 0.5,
    });

    return true;
  };

  const animateWithCss = () => {
    document.querySelector("#hero h1")?.classList.add("animate-in");
    document.querySelector("#hero p")?.classList.add("animate-in");
    document.querySelectorAll(".zzz-card").forEach((card, index) => {
      card.style.animationDelay = `${0.5 + index * 0.1}s`;
      card.classList.add("animate-in");
    });
  };

  if (!animateWithGsap()) {
    animateWithCss();
  }
})();

const text =
  "Specializing in building high-performance interactive web apps, spatial experiences, and Hollow exploration interfaces.";
let i = 0;
const speed = 8;

function typeWriter() {
  if (i < text.length) {
    document.getElementById("typewriter").innerHTML += text.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

window.onload = () => {
  setTimeout(typeWriter, 1000);
};
