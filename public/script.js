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
  populateDropdowns(json.data);
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
    const { states } = await res.json();

    stateSelect.innerHTML = '<option value="">All States</option>';
    states.forEach(state => {
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
    await fetchShops(currentPage);
  } catch (e) {
    console.error("Unable to load shops:", e);
    document.getElementById("shop-list").innerHTML = "<p>Unable to load shops.</p>";
  }
});
