document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Initialize Entrance Animations
  if (!prefersReducedMotion) {
    const heroSection = document.getElementById("hero");

    const animateWithGsap = () => {
      if (!window.gsap) {
        return false;
      }

      if (heroSection) {
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
      }

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

      return true;
    };

    const animateWithCss = () => {
      document.querySelector("#hero h1")?.classList.add("animate-in");
      document.querySelector("#typewriter")?.classList.add("animate-in");
      document.querySelectorAll(".zzz-card").forEach((card, index) => {
        card.style.animationDelay = `${0.3 + index * 0.08}s`;
        card.classList.add("animate-in");
      });
    };

    if (!animateWithGsap()) {
      animateWithCss();
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
