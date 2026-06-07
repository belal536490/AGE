const form = document.querySelector("#video-form");
const input = document.querySelector("#video-url");
const result = document.querySelector("#result");

const directVideoPattern = /\.(mp4|webm|ogg|ogv|mov)(\?.*)?$/i;

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

function renderDirectVideo(url) {
  const safeUrl = escapeAttribute(url);
  result.innerHTML = `
    <h3>Direct video file detected</h3>
    <p>Your link looks like a downloadable video file. Confirm you have permission, then use the button below.</p>
    <div class="result__media">
      <video controls src="${safeUrl}"></video>
    </div>
    <div class="result__actions">
      <a class="button button--primary" href="${safeUrl}" download>Download video</a>
      <a class="button button--secondary" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open file</a>
    </div>
  `;
}

function renderYouTubePreview(videoId, originalUrl) {
  const safeUrl = escapeAttribute(originalUrl);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  result.innerHTML = `
    <h3>YouTube link detected</h3>
    <p class="notice">This site does not download or extract YouTube videos. Please use YouTube's official player, sharing, and offline features where available.</p>
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
    renderDirectVideo(url);
    return;
  }

  renderUnsupported();
});
