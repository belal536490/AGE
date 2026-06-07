const form = document.querySelector("#video-form");
const input = document.querySelector("#video-url");
const result = document.querySelector("#result");

const directVideoPattern = /\.(mp4|webm|ogg|ogv|mov)(\?.*)?$/i;
const downloadableFormats = ["mp4", "webm", "ogg", "mov"];

function getSelectedFormat() {
  return new FormData(form).get("format") || "auto";
}

function getDirectVideoFormat(url) {
  const match = url.match(directVideoPattern);
  return match ? match[1].toLowerCase().replace("ogv", "ogg") : null;
}

function getFileName(url, format) {
  try {
    const { pathname } = new URL(url);
    const rawName = pathname.split("/").filter(Boolean).pop() || "video";
    const baseName = rawName.replace(/\.[^.]+$/, "") || "video";
    return `${baseName}.${format}`;
  } catch {
    return `video.${format}`;
  }
}

function getYouTubeId(url) {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;");
}

function renderFormatOptions(sourceFormat, selectedFormat, url, safeUrl) {
  const effectiveFormat = selectedFormat === "auto" ? sourceFormat : selectedFormat;

  return downloadableFormats
    .map((format) => {
      const isSourceFormat = format === sourceFormat;
      const isChosenFormat = format === effectiveFormat;
      const className = isSourceFormat
        ? "format-card format-card--available"
        : "format-card format-card--disabled";
      const action = isSourceFormat
        ? `<a class="button button--primary" href="${safeUrl}" download="${getFileName(url, format)}">Download ${format.toUpperCase()}</a>`
        : `<button class="button button--secondary" type="button" disabled>Needs converter</button>`;
      const status = isSourceFormat
        ? "Available now from this direct file link."
        : "Conversion requires a server or FFmpeg step before download.";

      return `
        <article class="${className}" ${isChosenFormat ? 'aria-current="true"' : ""}>
          <h4>${format.toUpperCase()}</h4>
          <p>${status}</p>
          ${action}
        </article>
      `;
    })
    .join("");
}

function renderDirectVideo(url, selectedFormat) {
  const safeUrl = escapeAttribute(url);
  const sourceFormat = getDirectVideoFormat(url);
  const requestedFormat = selectedFormat === "auto" ? sourceFormat : selectedFormat;
  const needsConversion = requestedFormat !== sourceFormat;

  result.innerHTML = `
    <h3>Direct video file detected</h3>
    <p>Your link is a direct <strong>${sourceFormat.toUpperCase()}</strong> video file. Use the available download button below.</p>
    ${
      needsConversion
        ? `<p class="notice">You selected ${requestedFormat.toUpperCase()}, but this source is ${sourceFormat.toUpperCase()}. A browser-only page cannot safely convert formats by itself, so download the original file or add a conversion backend.</p>`
        : ""
    }
    <div class="result__media">
      <video controls src="${safeUrl}"></video>
    </div>
    <div class="format-results">
      ${renderFormatOptions(sourceFormat, selectedFormat, url, safeUrl)}
    </div>
    <div class="result__actions">
      <a class="button button--secondary" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open original file</a>
    </div>
  `;
}

function renderYouTubePreview(videoId, originalUrl) {
  const safeUrl = escapeAttribute(originalUrl);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  result.innerHTML = `
    <h3>YouTube link detected</h3>
    <p class="notice">YouTube download formats are not provided here because this site does not download or extract YouTube videos. Please use YouTube's official player, sharing, and offline features where available.</p>
    <div class="result__media">
      <iframe src="${embedUrl}" title="YouTube video preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
    <div class="result__actions">
      <a class="button button--primary" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open on YouTube</a>
      <a class="button button--secondary" href="${thumbnailUrl}" target="_blank" rel="noopener noreferrer">View thumbnail</a>
    </div>
  `;
}

function renderUnsupported() {
  result.innerHTML = `
    <h3>We could not create a download action</h3>
    <p>Use a direct video file URL ending in MP4, WebM, OGG, or MOV. If this is a streaming platform link, use the platform's official viewing and download options.</p>
  `;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const url = input.value.trim();
  const selectedFormat = getSelectedFormat();

  if (!url) {
    return;
  }

  result.hidden = false;
  const youtubeId = getYouTubeId(url);

  if (youtubeId) {
    renderYouTubePreview(youtubeId, url);
    return;
  }

  if (directVideoPattern.test(url)) {
    renderDirectVideo(url, selectedFormat);
    return;
  }

  renderUnsupported();
});
