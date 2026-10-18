const descriptions = {
  vanilla: "바닐라빈을 사용해 더욱 깊고 진한 풍미. 정통 바닐라 아이스크림의 부드러움을 느껴보세요.",
  peanut: "고소한 땅콩 토핑이 더하는 풍부한 맛. 부드러운 바닐라에 기분 좋은 고소함이 어우러집니다.",
  chocolate:
    "달콤한 초콜릿 토핑과 바닐라의 만남. 달콤함과 고소함의 균형으로 클래식의 맛을 완성합니다.",
};
const progress = document.querySelector(".scroll-progress");
let scrollFrame = false;
function updateProgress() {
  const range = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${range > 0 ? Math.min(100, (scrollY / range) * 100) : 0}%`;
  scrollFrame = false;
}
addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) {
      scrollFrame = true;
      requestAnimationFrame(updateProgress);
    }
  },
  { passive: true },
);
addEventListener("resize", updateProgress);
updateProgress();
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".story-head,.stats,.cutting,.flavor-layout,.moment h2")
    .forEach((item) => {
      item.classList.add("reveal");
      observer.observe(item);
    });
}
document.querySelectorAll("[data-flavor]").forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-flavor]").forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    document.querySelector(".ingredient-description").textContent =
      descriptions[button.dataset.flavor];
    document.querySelector(".flavor-word").textContent = {
      vanilla: "VANILLA",
      peanut: "PEANUT",
      chocolate: "CHOCOLATE",
    }[button.dataset.flavor];
    document.querySelector(".flavor-art img").style.transform = {
      vanilla: "rotate(-16deg)",
      peanut: "rotate(8deg)",
      chocolate: "rotate(-8deg)",
    }[button.dataset.flavor];
  }),
);
document.querySelector(".love-button").addEventListener("click", (event) => {
  document.querySelector(".love-status").textContent = "당신의 오늘에도, 부라보! ♥";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = event.currentTarget.getBoundingClientRect();
  for (let i = 0; i < 12; i++) {
    const heart = document.createElement("span");
    heart.className = "burst";
    heart.textContent = "♥";
    heart.style.cssText = `left:${rect.left + rect.width / 2}px;top:${rect.top}px;color:${i % 2 ? "#77cce8" : "#e7353e"};--x:${(i - 6) * 30}px;animation-delay:${i * 25}ms`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1800);
  }
});
const header = document.querySelector("header");
const menuButton = document.querySelector(".mobile-menu");
function setMenu(open) {
  header.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
}
menuButton.addEventListener("click", () => setMenu(!header.classList.contains("menu-open")));
document
  .querySelectorAll("nav a")
  .forEach((link) => link.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header.classList.contains("menu-open")) {
    setMenu(false);
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) setMenu(false);
});
matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});
