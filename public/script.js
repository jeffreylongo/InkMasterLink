let currentPage = 1;
const itemsPerPage = 9;
let totalPages = 1;
let filters = {};
let lastFetched = [];

function buildQuery(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

async function fetchShops(page = 1) {
  const query = buildQuery({ ...filters, page, limit: itemsPerPage });
  const res = await fetch(`/.netlify/functions/shops?${query}`);
  const json = await res.json();
  if (!json || !Array.isArray(json.data)) throw new Error("Invalid shop data");
  lastFetched = json.data;
  totalPages = json.totalPages;
  currentPage = json.page;
  renderShops(json.data);
  updatePaginationControls(json.total);
}

function renderShops(shopsToRender) {
  const container = document.getElementById("shop-list");
  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "grid";
  shopsToRender.forEach(shop => {
    const card = document.createElement("div");
    card.className = "shop-card clickable";
    card.innerHTML = `
      <h2>${shop.name}</h2>
      <p>${shop.city}, ${shop.state}</p>
      <p>Rating: ${shop.rating}</p>
    `;
    card.addEventListener("click", () => showModal(shop));
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

function showModal(shop) {
  const modal = document.getElementById("modal-overlay");
  const details = document.getElementById("modal-details");
  details.innerHTML = `
    <h2>${shop.name}</h2>
    <p><strong>Address:</strong> ${shop.address}, ${shop.city}, ${shop.state} ${shop.zip}</p>
    <p><strong>Phone:</strong> ${shop.phone}</p>
    <p><strong>Rating:</strong> ${shop.rating}</p>
    <p><a href="${shop.website}" target="_blank">Website</a></p>
    <p><a href="mailto:${shop.email}">${shop.email}</a></p>
  `;
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("modal-overlay");
  if (modal) modal.style.display = "none";
}

function updatePaginationControls(totalItems) {
  document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === totalPages;
}

async function loadStatesDropdown() {
  const stateSelect = document.getElementById("filter-state");
  const citySelect = document.getElementById("filter-city");

  try {
    const res = await fetch("/.netlify/functions/locations");
    const json = await res.json();
    console.log("States response:", json);

    if (!json.states || json.states.length === 0) {
      console.warn("No states returned from API");
      return;
    }

    stateSelect.innerHTML = '<option value="">All States</option>';
    json.states.forEach(state => {
      const opt = document.createElement("option");
      opt.value = state;
      opt.textContent = state;
      stateSelect.appendChild(opt);
    });

    stateSelect.addEventListener("change", async () => {
      const selectedState = stateSelect.value;
      citySelect.innerHTML = '<option value="">All Cities</option>';
      if (selectedState) {
        const res = await fetch(`/.netlify/functions/locations?state=${selectedState}`);
        const { cities } = await res.json();
        cities.forEach(city => {
          const opt = document.createElement("option");
          opt.value = city;
          opt.textContent = city;
          citySelect.appendChild(opt);
        });
      }
      filterAndRender();
    });

  } catch (e) {
    console.error("Failed to load state/city dropdowns:", e);
  }
}

function filterAndRender() {
  filters = {
    name: document.getElementById("filter-name")?.value.trim().toLowerCase(),
    zip: document.getElementById("filter-zip")?.value.trim(),
    city: document.getElementById("filter-city")?.value,
    state: document.getElementById("filter-state")?.value,
    rating: document.getElementById("filter-rating")?.value
  };
  currentPage = 1;
  fetchShops(currentPage);
}

function showRandomTip() {
  const tattooTips = [
    "🥗 Eat a solid meal before your appointment to avoid dizziness or fainting.",
    "💧 Stay hydrated the day before and day of your tattoo — your skin will thank you.",
    "🚫 Avoid alcohol for at least 24 hours — it thins your blood and makes you bleed more.",
    "🧴 Moisturize daily leading up to your appointment, but skip lotion the day of.",
    "👕 Wear comfy clothes that give your artist easy access to the area being tattooed.",
    "🎧 Bring headphones, snacks, and something to do during long sessions.",
    "🎨 Trust your artist — their suggestions come from experience with design and placement.",
    "🧼 Ask your artist which aftercare products they recommend — every artist is different.",
    "🌊 No swimming, soaking, or long showers while your tattoo heals!",
    "🐍 Don’t pick or scratch your tattoo — even if it itches during healing.",
    "🗣️ Always follow your artist’s specific aftercare instructions — they know their work best.",
    "🧪 Don’t use Vaseline or random ointments unless your artist says so.",
    "🩹 Your tattoo is a wound — treat it with the same care you’d give a cut or scrape.",
    "🚷 Avoid tight clothes that rub on the fresh ink — let it breathe.",
    "⏱️ Keep your wrap on for the exact time your artist recommends — not less, not more.",
    "🧼 Show up freshly showered — clean skin helps your artist and shows respect.",
    "👫 Don’t bring a crowd unless your artist says it’s okay — most prefer a quiet space.",
    "🗓️ Don’t schedule your tattoo right before a beach trip, wedding, or major event.",
    "🤒 If you’re sick, reschedule — your body needs to focus on healing, not ink.",
    "⚠️ If you take medications or have conditions, tell your artist ahead of time.",
    "💊 Avoid aspirin or blood thinners unless medically necessary.",
    "❓ Ask questions! Good artists love educating their clients.",
    "💵 Tip your artist — tattoos are custom, physical, and personal work.",
    "✏️ Want to change something? Say so *before* the stencil goes on!",
    "❤️ Take care of your tattoo and it’ll stay sharp, bold, and beautiful for years."
  ];

  const tipEl = document.getElementById("tip-content");
  if (!tipEl) return;
  const randomIndex = Math.floor(Math.random() * tattooTips.length);
  tipEl.textContent = tattooTips[randomIndex];
}

document.addEventListener("DOMContentLoaded", async () => {
  const modal = document.getElementById("modal-overlay");
  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) closeModal();
    });
    const closeBtn = document.querySelector(".modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
  }

  document.querySelectorAll("#filters input, #filters select").forEach(input => {
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(filterAndRender, 250);
    });
    input.addEventListener("change", filterAndRender);
  });

  document.getElementById("clear-filters")?.addEventListener("click", async () => {
    ["filter-name", "filter-zip", "filter-city", "filter-state", "filter-rating"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    filters = {};
    currentPage = 1;
    await loadStatesDropdown();
    fetchShops(currentPage);
  });

  document.getElementById("prev-page")?.addEventListener("click", () => {
    if (currentPage > 1) fetchShops(--currentPage);
  });

  document.getElementById("next-page")?.addEventListener("click", () => {
    if (currentPage < totalPages) fetchShops(++currentPage);
  });

  try {
    await loadStatesDropdown();
    await fetchShops(currentPage);
  } catch (e) {
    console.error("Unable to load shops:", e);
    document.getElementById("shop-list").innerHTML = "<p>Unable to load shops.</p>";
  }

  // ✅ Show random tip once DOM is ready
  showRandomTip();
});

