const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");
$("#year").textContent = new Date().getFullYear();

// Tema
$("#theme").addEventListener("click", () => {
  const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("theme", t); } catch (e) {}
});

// Menu mobile
const burger = $("#burger"), menu = $("#menu");
const setMenu = (o) => { menu.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); };
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
$$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Progress bar + garis timeline
const bar = $(".progress"), tl = $(".tl");
const onScroll = () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  const r = tl.getBoundingClientRect();
  tl.style.setProperty("--p", Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height)));
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();

// Reveal saat scroll (dengan jeda berurutan antar elemen bersaudara)
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.15 });
$$(".rv").forEach((el) => {
  el.style.setProperty("--d", [...el.parentElement.children].filter((c) => c.classList.contains("rv")).indexOf(el) * 0.09 + "s");
  io.observe(el);
});

// Menu aktif sesuai bagian yang terlihat
const links = $$("#menu a[href^='#']");
const spy = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.hash === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section").forEach((s) => spy.observe(s));

// Hitung naik angka statistik
const count = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return; count.unobserve(e.target);
  const el = e.target, n = +el.dataset.n, suf = el.dataset.suf || "";
  if (reduce) { el.textContent = n + suf; return; }
  const t0 = performance.now();
  (function tick(t) {
    const p = Math.min(1, (t - t0) / 1400);
    el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + suf;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}), { threshold: 0.6 });
$$("[data-n]").forEach((el) => count.observe(el));

// Terminal: baris diketik satu per satu lalu muncul ringkasan
const lines = $$("#term li"), sum = $("#sum");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function run() {
  if (reduce) { lines.forEach((l) => l.classList.add("in")); sum.classList.add("in"); return; }
  const texts = lines.map((l) => l.dataset.t);
  lines.forEach((l) => (l.textContent = ""));
  await sleep(1100);
  for (let i = 0; i < lines.length; i++) {
    lines[i].classList.add("in", "typing");
    for (const ch of texts[i]) { lines[i].textContent += ch; await sleep(14); }
    lines[i].classList.remove("typing"); await sleep(180);
  }
  sum.classList.add("in");
}
run();

// Buka-tutup detail proyek
$$(".card-h").forEach((b) => b.addEventListener("click", () => {
  const card = b.closest(".card"), open = card.classList.toggle("open");
  b.setAttribute("aria-expanded", open);
}));

// Kemiringan halus mengikuti kursor (hanya perangkat dengan mouse)
if (!reduce && matchMedia("(hover: hover)").matches) {
  $$("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 6 + "deg");
      el.style.setProperty("--rx", (0.5 - (e.clientY - r.top) / r.height) * 6 + "deg");
    });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });
}
