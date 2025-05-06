// script.js

let debounceTimer;
let currentPage = 1;
const itemsPerPage = 9;
let filteredShops = [];
let shops = [];

async function fetchShops() {
  try {
    const cached = localStorage.getItem("cachedShops");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }

    const res = await fetch("/.netlify/functions/shops");
    const data = await res.json();
    if (Array.isArray(data)) {
      localStorage.setItem("cachedShops", JSON.stringify(data));
      return data;
    } else {
      throw new Error("Invalid data structure");
    }
  } catch (e) {
    console.error("Failed to fetch shops:", e);
    return [];
  }
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

function renderShops(shopsToRender) {
  const container = document.getElementById("shop-list");
  container.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = shopsToRender.slice(start, end);
  const grid = document.createElement("div");
  grid.className = "grid";
  paginated.forEach(shop => {
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
  updatePaginationControls(shopsToRender.length);
}

function updatePaginationControls(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === totalPages;
}

function populateDropdowns(shops) {
  const citySelect = document.getElementById("filter-city");
  const stateSelect = document.getElementById("filter-state");
  const stateMap = {};

  shops.forEach(shop => {
    const state = shop.state?.trim().toUpperCase();
    const city = shop.city?.trim();
    if (state && city) {
      if (!stateMap[state]) stateMap[state] = new Set();
      stateMap[state].add(city);
    }
  });

  stateSelect.innerHTML = '<option value="">All States</option>';
  Object.keys(stateMap).sort().forEach(state => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });

  function updateCityDropdown() {
    const selectedState = stateSelect.value;
    citySelect.innerHTML = '<option value="">All Cities</option>';
    if (stateMap[selectedState]) {
      Array.from(stateMap[selectedState]).sort().forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    }
  }

  stateSelect.addEventListener("change", () => {
    updateCityDropdown();
    filterAndRender();
  });

  updateCityDropdown();
}

function applyFilters(data) {
  const name = document.getElementById("filter-name")?.value.toLowerCase();
  const zip = document.getElementById("filter-zip")?.value;
  const city = document.getElementById("filter-city")?.value;
  const state = document.getElementById("filter-state")?.value;
  const rating = parseFloat(document.getElementById("filter-rating")?.value);
  return data.filter(shop => {
    return (!name || shop.name.toLowerCase().includes(name)) &&
           (!zip || shop.zip.startsWith(zip)) &&
           (!city || shop.city === city) &&
           (!state || shop.state === state) &&
           (!rating || parseFloat(shop.rating) >= rating);
  });
}

function filterAndRender() {
  currentPage = 1;
  filteredShops = applyFilters(shops || []);
  renderShops(filteredShops);
}

document.addEventListener("DOMContentLoaded", async () => {
  const modal = document.getElementById("modal-overlay");
  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) closeModal();
    });
  }

  const closeButton = document.querySelector(".modal-close");
  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  try {
    shops = await fetchShops();
    if (!Array.isArray(shops) || shops.length === 0) throw new Error("Invalid or empty shop data");

    const shopListEl = document.getElementById("shop-list");
    const cityListEl = document.getElementById("city-shop-list");

    if (shopListEl) {
      populateDropdowns(shops);
      filteredShops = applyFilters(shops);
      renderShops(filteredShops);
    }

    if (cityListEl) {
      const city = cityListEl.dataset.city;
      const state = cityListEl.dataset.state;
      const cityShops = shops.filter(s => s.city === city && s.state === state);

      if (cityShops.length === 0) {
        cityListEl.innerHTML += "<p>No shops found for this location.</p>";
      } else {
        const grid = document.createElement("div");
        grid.className = "grid";
        cityShops.forEach(shop => {
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
        cityListEl.appendChild(grid);
      }
    }
  } catch (e) {
    console.error("Failed to load shops:", e);
    const shopListEl = document.getElementById("shop-list");
    if (shopListEl) shopListEl.innerHTML = "<p>Unable to load shops.</p>";
  }

  const filterInputs = document.querySelectorAll("#filters input, #filters select");
  filterInputs.forEach(input => {
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(filterAndRender, 300);
    });
    input.addEventListener("change", filterAndRender);
  });

  const clearBtn = document.getElementById("clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ["filter-name", "filter-zip", "filter-city", "filter-state", "filter-rating"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      currentPage = 1;
      filterAndRender();
    });
  }

  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderShops(filteredShops);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderShops(filteredShops);
      }
    });
  }
});
