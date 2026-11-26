(function () {
  const entries = Array.isArray(window.WORK_LOG) ? [...window.WORK_LOG] : [];

  function parseLocalDate(isoDate) {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatISODate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function formatMainDate(dateObj) {
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function formatFullDate(dateObj) {
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatWeekday(dateObj, isoDate) {
    const today = new Date();
    const todayISO = formatISODate(today);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayISO = formatISODate(yesterday);

    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });

    if (isoDate === todayISO) return `${weekday} · Today`;
    if (isoDate === yesterdayISO) return `${weekday} · Yesterday`;
    return `${weekday}, ${dateObj.getFullYear()}`;
  }

  // Group entries by date (newest first)
  const byDate = new Map();
  entries
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((item) => {
      if (!byDate.has(item.date)) {
        byDate.set(item.date, []);
      }
      byDate.get(item.date).push(item);
    });

  const orderedDates = Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a));

  // Render header summary strip
  const summaryEl = document.getElementById("summary-strip");
  if (summaryEl && orderedDates.length > 0) {
    const latestDateObj = parseLocalDate(orderedDates[0]);
    const uniqueLinks = new Set(entries.map((e) => e.url)).size;

    summaryEl.innerHTML = `
      <span class="summary-item"><strong>${orderedDates.length}</strong> ${
        orderedDates.length === 1 ? "day" : "days"
      } logged</span>
      <span class="summary-divider" aria-hidden="true">·</span>
      <span class="summary-item"><strong>${uniqueLinks}</strong> ${
        uniqueLinks === 1 ? "deliverable" : "deliverables"
      }</span>
      <span class="summary-divider" aria-hidden="true">·</span>
      <span class="summary-item">Latest update: <strong>${formatFullDate(latestDateObj)}</strong></span>
    `;
  }

  // Render timeline
  const timelineEl = document.getElementById("timeline");
  if (!timelineEl) return;

  const todayISO = formatISODate(new Date());

  orderedDates.forEach((isoDate, index) => {
    const dayItems = byDate.get(isoDate);
    const dateObj = parseLocalDate(isoDate);

    const li = document.createElement("li");
    li.className = "day-row";
    if (index === 0) li.classList.add("is-latest");
    if (isoDate === todayISO) li.classList.add("is-today");

    const dateCol = document.createElement("div");
    dateCol.className = "day-date-col";

    const mainSpan = document.createElement("span");
    mainSpan.className = "date-main";
    mainSpan.textContent = formatMainDate(dateObj);

    const subSpan = document.createElement("span");
    subSpan.className = "date-sub";
    subSpan.textContent = formatWeekday(dateObj, isoDate);

    dateCol.appendChild(mainSpan);
    dateCol.appendChild(subSpan);

    const cardsCol = document.createElement("div");
    cardsCol.className = "day-cards";

    dayItems.forEach((item) => {
      const card = document.createElement("a");
      card.className = "work-card";
      card.href = item.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      const isApp = item.kind === "app";

      card.innerHTML = `
        <div class="card-top">
          <div class="card-heading-wrap">
            <h2 class="card-title"></h2>
            <span class="type-tag ${isApp ? "is-app" : "is-guide"}"></span>
          </div>
          <span class="card-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4.5 11.5L11.5 4.5M11.5 4.5H5.75M11.5 4.5V10.25"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </div>
        <p class="card-summary"></p>
        <span class="card-source">
          <span class="card-source-dot" aria-hidden="true"></span>
          <span class="card-source-text"></span>
        </span>
      `;

      card.querySelector(".card-title").textContent = item.title;
      card.querySelector(".type-tag").textContent = item.type;
      card.querySelector(".card-summary").textContent = item.summary;
      card.querySelector(".card-source-text").textContent = item.sourceLabel || item.url;

      cardsCol.appendChild(card);
    });

    li.appendChild(dateCol);
    li.appendChild(cardsCol);
    timelineEl.appendChild(li);
  });
})();
