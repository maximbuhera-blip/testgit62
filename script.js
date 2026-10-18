const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
const form = document.querySelector("#contact-form");
const statusEl = document.querySelector(".form-status");
const bgPicker = document.querySelector("#bg-color");
const swatches = document.querySelectorAll(".swatches button");
const BG_KEY = "bg-color";
const DEFAULT_BG = "#0b0d12";

function hexToRgb(hex) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  const value = Number.parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function isLight(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2] > 0.45;
}

function setBackground(hex) {
  const color = hex || DEFAULT_BG;
  const light = isLight(color);
  const root = document.documentElement;

  root.style.setProperty("--bg", color);
  root.style.setProperty(
    "--bg-elevated",
    light ? `color-mix(in srgb, ${color} 88%, #000 12%)` : `color-mix(in srgb, ${color} 78%, #fff 22%)`
  );
  root.style.setProperty("--text", light ? "#12141a" : "#e8eaef");
  root.style.setProperty("--muted", light ? "#4d5565" : "#9aa3b5");
  root.style.setProperty("--line", light ? "rgba(18, 20, 26, 0.14)" : "rgba(255, 255, 255, 0.08)");

  if (bgPicker) bgPicker.value = color;
  swatches.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.bg === color));
  });
  localStorage.setItem(BG_KEY, color);
}

setBackground(localStorage.getItem(BG_KEY) || DEFAULT_BG);

bgPicker?.addEventListener("input", (event) => {
  setBackground(event.target.value);
});

swatches.forEach((button) => {
  button.addEventListener("click", () => setBackground(button.dataset.bg));
});

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  statusEl.classList.remove("error");

  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !message) {
    statusEl.textContent = "Заповніть усі поля, будь ласка.";
    statusEl.classList.add("error");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    statusEl.textContent = "Перевірте формат email.";
    statusEl.classList.add("error");
    return;
  }

  form.reset();
  statusEl.textContent = "Дякую! Це демо: повідомлення нікуди не надсилається.";
});
