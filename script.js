/*
  SETUP:
  1) Deploy Code.gs as a Google Apps Script Web App.
  2) Copy the Web App URL and paste it into SHEETS_WEB_APP_URL below.
*/
// ======================================
// MUSIK UNDANGAN DAN TOMBOL BUKA
// ======================================

const backgroundMusic = document.getElementById("backgroundMusic");
const openButton = document.getElementById("openInvitation");
const musicToggle = document.getElementById("musicToggle");

let musicIsPlaying = false;

// Atur volume musik
backgroundMusic.volume = 0.5;

// Klik tombol Buka Undangan
openButton.addEventListener("click", () => {

    // Putar musik
    backgroundMusic.play()
        .catch(error => {
            console.log("Musik gagal diputar:", error);
        });

    // Scroll menuju hero
    document.getElementById("hero").scrollIntoView({
        behavior: "smooth"
    });

});
const params = new URLSearchParams(window.location.search);
const guest = params.get("to");
if (guest) document.getElementById("guestName").textContent = guest.replace(/[<>]/g, "").slice(0, 80);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const wishesList = document.getElementById("wishesList");
const wishCount = document.getElementById("wishCount");
const localWishes = [];

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[ch]);
}

function renderWishes(items) {
  wishesList.innerHTML = "";
  wishCount.textContent = `${items.length} ucapan`;
  if (!items.length) {
    wishesList.innerHTML = '<p class="empty-wishes">Belum ada ucapan. Jadilah yang pertama mengirimkan doa!</p>';
    return;
  }
  items.slice(0, 50).forEach(item => {
    const card = document.createElement("article");
    card.className = "wish-card";
    card.innerHTML = `<div class="wish-top"><strong>${escapeHTML(item.name)}</strong><span>${escapeHTML(item.date || "")}</span></div>
      <p>${escapeHTML(item.message)}</p><span class="wish-attendance">${escapeHTML(item.attendance)}</span>`;
    wishesList.appendChild(card);
  });
}

function loadWishes() {
  if (!SHEETS_WEB_APP_URL.startsWith("https://script.google.com/")) return;
  const callbackName = "receiveKhitanWishes";
  window[callbackName] = data => {
    if (data && Array.isArray(data.wishes)) {
      const merged = [...data.wishes];
      localWishes.forEach(local => {
        if (!merged.some(item => item.id && item.id === local.id)) merged.unshift(local);
      });
      renderWishes(merged);
    }
    delete window[callbackName];
    script.remove();
  };
  const script = document.createElement("script");
  script.src = `${SHEETS_WEB_APP_URL}?action=list&callback=${callbackName}&_=${Date.now()}`;
  script.onerror = () => { delete window[callbackName]; script.remove(); };
  document.body.appendChild(script);
}

function submitToSheet(payload) {
  return new Promise((resolve, reject) => {
    if (!SHEETS_WEB_APP_URL.startsWith("https://script.google.com/")) {
      reject(new Error("Alamat Google Apps Script belum dipasang. Silakan hubungi penyelenggara undangan."));
      return;
    }
    const frameName = "rsvp-submit-frame";
    let iframe = document.getElementById(frameName);
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.name = frameName;
      iframe.id = frameName;
      iframe.hidden = true;
      document.body.appendChild(iframe);
    }
    const handler = event => {
      if (event.data && event.data.type === "khitan-rsvp-result" && event.data.token === payload.token) {
        window.removeEventListener("message", handler);
        clearTimeout(timeout);
        if (event.data.ok) resolve(event.data);
        else reject(new Error(event.data.message || "Ucapan belum berhasil disimpan."));
      }
    };
    window.addEventListener("message", handler);
    const timeout = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("Belum menerima konfirmasi dari Google Sheets. Periksa koneksi atau coba lagi."));
    }, 20000);

    const postForm = document.createElement("form");
    postForm.method = "POST";
    postForm.action = SHEETS_WEB_APP_URL;
    postForm.target = frameName;
    postForm.hidden = true;
    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      postForm.appendChild(input);
    });
    document.body.appendChild(postForm);
    postForm.submit();
    postForm.remove();
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form-status";
  const payload = {
    name: form.elements.name.value.trim(),
    attendance: form.elements.attendance.value,
    message: form.elements.message.value.trim(),
    token: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  };
  if (!payload.name || !payload.attendance || !payload.message) {
    statusEl.textContent = "Mohon lengkapi semua kolom terlebih dahulu.";
    statusEl.classList.add("error");
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim...";
  try {
    const result = await submitToSheet(payload);
    const wish = {
      id: result.id || payload.token,
      name: payload.name,
      attendance: payload.attendance,
      message: payload.message,
      date: "Baru saja"
    };
    localWishes.unshift(wish);
    renderWishes(localWishes);
    form.reset();
    statusEl.textContent = "Alhamdulillah, ucapan berhasil dikirim dan tersimpan. Terima kasih atas doanya!";
    statusEl.classList.add("success");
    loadWishes();
  } catch (error) {
    statusEl.textContent = error.message;
    statusEl.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Kirim Ucapan <span>➜</span>';
  }
});
// ======================================
// TOMBOL MUSIK ON / OFF
// ======================================

musicToggle.addEventListener("click", function () {

    if (musicIsPlaying) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play()
            .catch(error => {
                console.log("Musik gagal diputar:", error);
            });
    }

});

// Sinkronisasi status musik
backgroundMusic.addEventListener("play", function () {
    musicIsPlaying = true;
    musicToggle.innerHTML = "Ⅱ";
    musicToggle.setAttribute("aria-label", "Matikan musik");
});

backgroundMusic.addEventListener("pause", function () {
    musicIsPlaying = false;
    musicToggle.innerHTML = "♫";
    musicToggle.setAttribute("aria-label", "Putar musik");
});