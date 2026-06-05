const ownerAccount = {
  id: 'owner-001',
  name: 'Company Owner',
  email: 'owner@streamdesk.local',
  password: 'Owner@123',
  role: 'owner',
  status: 'active',
  joinedAt: '2026-06-05'
};

const adminAccount = {
  id: 'admin-001',
  name: 'Upload Admin',
  email: 'admin@streamdesk.local',
  password: 'Admin@123',
  role: 'admin',
  status: 'active',
  joinedAt: '2026-06-05'
};

const starterVideos = [
  {
    id: 'vid-001',
    title: 'বাংলা টেক রিভিউ: নতুন গ্যাজেট',
    category: 'Technology',
    creator: 'StreamDesk Studio',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    description: 'টেক নিউজ, রিভিউ এবং ব্যবহারকারীদের জন্য সহজ টিউটোরিয়াল।',
    views: 128400,
    status: 'published',
    uploadedBy: 'admin@streamdesk.local',
    uploadedAt: '2026-06-05'
  },
  {
    id: 'vid-002',
    title: 'কুকিং শো: ১০ মিনিটে ঝটপট নাস্তা',
    category: 'Lifestyle',
    creator: 'Daily Kitchen',
    thumbnail: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=900&q=80',
    description: 'পরিবারের সবার জন্য সহজ, মজাদার এবং দ্রুত রান্নার রেসিপি।',
    views: 84200,
    status: 'published',
    uploadedBy: 'admin@streamdesk.local',
    uploadedAt: '2026-06-04'
  },
  {
    id: 'vid-003',
    title: 'মিউজিক লাইভ: অ্যাকুস্টিক সন্ধ্যা',
    category: 'Music',
    creator: 'Open Stage',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    description: 'নতুন শিল্পীদের লাইভ পারফরম্যান্স এবং দর্শকদের রিকোয়েস্ট।',
    views: 210700,
    status: 'review',
    uploadedBy: 'admin@streamdesk.local',
    uploadedAt: '2026-06-03'
  }
];

const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

function seedData() {
  if (!localStorage.getItem('streamdesk_users')) {
    storage.set('streamdesk_users', [ownerAccount, adminAccount]);
  }
  if (!localStorage.getItem('streamdesk_videos')) {
    storage.set('streamdesk_videos', starterVideos);
  }
  if (!localStorage.getItem('streamdesk_current_user')) {
    storage.set('streamdesk_current_user', null);
  }
}

const state = {
  route: 'home',
  query: '',
  selectedCategory: 'All',
  selectedVideoId: 'vid-001',
  get users() {
    return storage.get('streamdesk_users', []);
  },
  set users(value) {
    storage.set('streamdesk_users', value);
  },
  get videos() {
    return storage.get('streamdesk_videos', []);
  },
  set videos(value) {
    storage.set('streamdesk_videos', value);
  },
  get currentUser() {
    return storage.get('streamdesk_current_user', null);
  },
  set currentUser(value) {
    storage.set('streamdesk_current_user', value);
  }
};

const app = document.querySelector('#app');
const money = new Intl.NumberFormat('bn-BD');
const categories = ['All', 'Technology', 'Lifestyle', 'Music', 'Education', 'Sports', 'News'];

function canUpload(user) {
  return user?.role === 'admin' || user?.role === 'owner';
}

function requireRole(allowedRoles) {
  const user = state.currentUser;
  return user && allowedRoles.includes(user.role) && user.status === 'active';
}

function getVisibleVideos() {
  return state.videos.filter((video) => {
    const matchesCategory = state.selectedCategory === 'All' || video.category === state.selectedCategory;
    const matchesSearch = `${video.title} ${video.creator} ${video.category}`.toLowerCase().includes(state.query.toLowerCase());
    const canSeeReview = video.status === 'published' || canUpload(state.currentUser);
    return matchesCategory && matchesSearch && canSeeReview;
  });
}

function setRoute(route) {
  state.route = route;
  render();
}

function updateUser(updatedUser) {
  state.users = state.users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
  if (state.currentUser?.id === updatedUser.id) {
    state.currentUser = updatedUser;
  }
}

function deleteVideo(videoId) {
  state.videos = state.videos.filter((video) => video.id !== videoId);
  if (state.selectedVideoId === videoId) {
    state.selectedVideoId = state.videos[0]?.id ?? null;
  }
  render();
}

function publishVideo(videoId) {
  state.videos = state.videos.map((video) => (video.id === videoId ? { ...video, status: 'published' } : video));
  render();
}

function setUserStatus(userId, status) {
  const user = state.users.find((entry) => entry.id === userId);
  if (!user || user.role === 'owner') return;
  updateUser({ ...user, status });
  render();
}

function setUserRole(userId, role) {
  const user = state.users.find((entry) => entry.id === userId);
  if (!user || user.role === 'owner') return;
  updateUser({ ...user, role });
  render();
}

function formatViews(views) {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return money.format(views);
}

function nav() {
  const user = state.currentUser;
  return `
    <header class="topbar">
      <button class="brand" data-route="home" aria-label="হোমে ফিরুন">
        <span class="play-logo">▶</span>
        <span>StreamDesk</span>
      </button>
      <form class="search-form" id="searchForm">
        <input id="searchInput" name="search" type="search" placeholder="ভিডিও সার্চ করুন" value="${escapeHtml(state.query)}" />
        <button type="submit">সার্চ</button>
      </form>
      <nav class="nav-actions">
        ${canUpload(user) ? '<button data-route="admin">Admin Panel</button>' : ''}
        ${user?.role === 'owner' ? '<button data-route="owner">Owner Control</button>' : ''}
        ${user ? `<span class="user-chip">${escapeHtml(user.name)} · ${user.role}</span><button id="logoutBtn">Logout</button>` : '<button data-route="auth">Login / Sign up</button>'}
      </nav>
    </header>
  `;
}

function homePage() {
  const visibleVideos = getVisibleVideos();
  const selectedVideo = state.videos.find((video) => video.id === state.selectedVideoId) ?? visibleVideos[0];
  return `
    <main class="layout">
      <aside class="sidebar">
        <h3>ক্যাটাগরি</h3>
        ${categories.map((category) => `<button class="category ${state.selectedCategory === category ? 'active' : ''}" data-category="${category}">${category}</button>`).join('')}
        <div class="info-card">
          <h4>ডেমো অ্যাকাউন্ট</h4>
          <p><strong>Owner:</strong> owner@streamdesk.local / Owner@123</p>
          <p><strong>Admin:</strong> admin@streamdesk.local / Admin@123</p>
        </div>
      </aside>
      <section class="watch-area">
        ${selectedVideo ? player(selectedVideo) : emptyState('কোনো ভিডিও পাওয়া যায়নি', 'অ্যাডমিন প্যানেল থেকে নতুন ভিডিও আপলোড করুন।')}
      </section>
      <section class="video-grid" aria-label="ভিডিও তালিকা">
        ${visibleVideos.map(videoCard).join('') || emptyState('ভিডিও নেই', 'আপনার সার্চ বা ক্যাটাগরি পরিবর্তন করুন।')}
      </section>
    </main>
  `;
}

function player(video) {
  return `
    <article class="player-card">
      <div class="video-frame" style="background-image: linear-gradient(45deg, rgba(0,0,0,.55), rgba(0,0,0,.1)), url('${escapeAttribute(video.thumbnail)}')">
        <button class="big-play">▶</button>
      </div>
      <div class="player-meta">
        <div>
          <span class="pill">${escapeHtml(video.category)}</span>
          ${video.status === 'review' ? '<span class="pill warning">Review</span>' : ''}
          <h1>${escapeHtml(video.title)}</h1>
          <p>${escapeHtml(video.description)}</p>
          <strong>${formatViews(video.views)} views</strong> · <span>${escapeHtml(video.creator)}</span>
        </div>
        <button class="primary" data-route="auth">Subscribe</button>
      </div>
    </article>
  `;
}

function videoCard(video) {
  return `
    <article class="video-card ${state.selectedVideoId === video.id ? 'selected' : ''}" data-video="${video.id}">
      <img src="${escapeAttribute(video.thumbnail)}" alt="${escapeAttribute(video.title)} thumbnail" />
      <div>
        <h3>${escapeHtml(video.title)}</h3>
        <p>${escapeHtml(video.creator)} · ${formatViews(video.views)} views</p>
        <span class="pill">${escapeHtml(video.category)}</span>
        ${video.status === 'review' ? '<span class="pill warning">Review</span>' : ''}
      </div>
    </article>
  `;
}

function authPage() {
  return `
    <main class="auth-shell">
      <section class="auth-card">
        <h1>অ্যাকাউন্টে লগইন করুন</h1>
        <form id="loginForm" class="stacked-form">
          <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
          <label>Password<input name="password" type="password" required placeholder="Password" /></label>
          <button class="primary" type="submit">Login</button>
        </form>
      </section>
      <section class="auth-card highlight">
        <h1>নতুন ইউজার অ্যাকাউন্ট খুলুন</h1>
        <form id="signupForm" class="stacked-form">
          <label>Name<input name="name" required placeholder="আপনার নাম" /></label>
          <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
          <label>Password<input name="password" type="password" minlength="6" required placeholder="কমপক্ষে ৬ অক্ষর" /></label>
          <button class="primary" type="submit">Create Account</button>
        </form>
      </section>
    </main>
  `;
}

function adminPage() {
  if (!requireRole(['admin', 'owner'])) {
    return gatedPage('Admin Panel', 'শুধু অ্যাডমিন অথবা মালিক ভিডিও আপলোড ও মডারেট করতে পারবেন।');
  }

  return `
    <main class="dashboard">
      <section class="panel hero-panel">
        <div>
          <p class="eyebrow">Admin Panel</p>
          <h1>ভিডিও আপলোড ও কনটেন্ট মডারেশন</h1>
          <p>এখান থেকে নতুন ভিডিও যুক্ত, review ভিডিও publish, অথবা অনুপযুক্ত ভিডিও delete করা যায়।</p>
        </div>
      </section>
      <section class="panel">
        <h2>নতুন ভিডিও আপলোড</h2>
        <form id="uploadForm" class="upload-grid">
          <label>Title<input name="title" required placeholder="ভিডিওর শিরোনাম" /></label>
          <label>Creator<input name="creator" required placeholder="চ্যানেল/ক্রিয়েটর" /></label>
          <label>Category
            <select name="category">${categories.filter((category) => category !== 'All').map((category) => `<option>${category}</option>`).join('')}</select>
          </label>
          <label>Thumbnail URL<input name="thumbnail" type="url" required placeholder="https://..." /></label>
          <label class="wide">Description<textarea name="description" required placeholder="ভিডিওর বর্ণনা"></textarea></label>
          <label>Status
            <select name="status"><option value="published">Published</option><option value="review">Review</option></select>
          </label>
          <button class="primary" type="submit">Upload Video</button>
        </form>
      </section>
      <section class="panel">
        <h2>ভিডিও ম্যানেজমেন্ট</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead>
            <tbody>${state.videos.map((video) => `
              <tr>
                <td>${escapeHtml(video.title)}</td>
                <td>${escapeHtml(video.category)}</td>
                <td><span class="pill ${video.status === 'review' ? 'warning' : ''}">${escapeHtml(video.status)}</span></td>
                <td>${formatViews(video.views)}</td>
                <td class="row-actions">
                  ${video.status === 'review' ? `<button data-publish="${video.id}">Publish</button>` : ''}
                  <button class="danger" data-delete-video="${video.id}">Delete</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `;
}

function ownerPage() {
  if (!requireRole(['owner'])) {
    return gatedPage('Owner Control', 'শুধু কোম্পানির মালিক পুরো সিস্টেম, ইউজার এবং অ্যাডমিন নিয়ন্ত্রণ করতে পারবেন।');
  }

  const totalViews = state.videos.reduce((sum, video) => sum + video.views, 0);
  const admins = state.users.filter((user) => user.role === 'admin').length;
  const users = state.users.filter((user) => user.role === 'user').length;

  return `
    <main class="dashboard">
      <section class="panel hero-panel owner-hero">
        <div>
          <p class="eyebrow">Company Owner Control</p>
          <h1>সবকিছু কন্ট্রোল করার কেন্দ্রীয় ড্যাশবোর্ড</h1>
          <p>মালিক অ্যাডমিন বানাতে, ইউজার ব্লক করতে, কনটেন্ট publish/delete করতে এবং প্ল্যাটফর্মের পরিসংখ্যান দেখতে পারবেন।</p>
        </div>
      </section>
      <section class="metrics">
        <div class="metric"><span>${state.videos.length}</span><p>Total Videos</p></div>
        <div class="metric"><span>${formatViews(totalViews)}</span><p>Total Views</p></div>
        <div class="metric"><span>${admins}</span><p>Admins</p></div>
        <div class="metric"><span>${users}</span><p>Users</p></div>
      </section>
      <section class="panel">
        <h2>User & Admin Control</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Controls</th></tr></thead>
            <tbody>${state.users.map(ownerUserRow).join('')}</tbody>
          </table>
        </div>
      </section>
    </main>
  `;
}

function ownerUserRow(user) {
  const protectedOwner = user.role === 'owner';
  return `
    <tr>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td><span class="pill">${escapeHtml(user.role)}</span></td>
      <td><span class="pill ${user.status === 'blocked' ? 'danger-pill' : ''}">${escapeHtml(user.status)}</span></td>
      <td class="row-actions">
        ${protectedOwner ? '<em>Protected owner account</em>' : `
          <button data-role="admin" data-user="${user.id}">Make Admin</button>
          <button data-role="user" data-user="${user.id}">Make User</button>
          <button class="danger" data-status="${user.status === 'blocked' ? 'active' : 'blocked'}" data-user="${user.id}">${user.status === 'blocked' ? 'Unblock' : 'Block'}</button>
        `}
      </td>
    </tr>
  `;
}

function gatedPage(title, message) {
  return `
    <main class="auth-shell">
      <section class="auth-card">
        <h1>${title}</h1>
        <p>${message}</p>
        <button class="primary" data-route="auth">Login করুন</button>
      </section>
    </main>
  `;
}

function emptyState(title, message) {
  return `<div class="empty-state"><h2>${title}</h2><p>${message}</p></div>`;
}

function toast(message, tone = 'success') {
  const notice = document.createElement('div');
  notice.className = `toast ${tone}`;
  notice.textContent = message;
  document.body.appendChild(notice);
  setTimeout(() => notice.remove(), 2600);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function bindEvents() {
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => setRoute(button.dataset.route));
  });

  document.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCategory = button.dataset.category;
      render();
    });
  });

  document.querySelectorAll('[data-video]').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedVideoId = card.dataset.video;
      render();
    });
  });

  document.querySelector('#logoutBtn')?.addEventListener('click', () => {
    state.currentUser = null;
    toast('লগআউট সম্পন্ন হয়েছে');
    setRoute('home');
  });

  document.querySelector('#searchForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.query = new FormData(event.currentTarget).get('search') ?? document.querySelector('#searchInput')?.value ?? '';
    render();
  });

  document.querySelector('#searchInput')?.addEventListener('input', (event) => {
    state.query = event.target.value;
    render();
  });

  document.querySelector('#loginForm')?.addEventListener('submit', handleLogin);
  document.querySelector('#signupForm')?.addEventListener('submit', handleSignup);
  document.querySelector('#uploadForm')?.addEventListener('submit', handleUpload);

  document.querySelectorAll('[data-publish]').forEach((button) => {
    button.addEventListener('click', () => publishVideo(button.dataset.publish));
  });

  document.querySelectorAll('[data-delete-video]').forEach((button) => {
    button.addEventListener('click', () => deleteVideo(button.dataset.deleteVideo));
  });

  document.querySelectorAll('[data-status]').forEach((button) => {
    button.addEventListener('click', () => setUserStatus(button.dataset.user, button.dataset.status));
  });

  document.querySelectorAll('[data-role]').forEach((button) => {
    button.addEventListener('click', () => setUserRole(button.dataset.user, button.dataset.role));
  });
}

function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get('email')).toLowerCase().trim();
  const password = String(form.get('password'));
  const user = state.users.find((entry) => entry.email.toLowerCase() === email && entry.password === password);

  if (!user) return toast('ইমেইল বা পাসওয়ার্ড ভুল', 'error');
  if (user.status === 'blocked') return toast('এই অ্যাকাউন্ট ব্লক করা হয়েছে', 'error');

  state.currentUser = user;
  toast(`স্বাগতম, ${user.name}`);
  setRoute(user.role === 'owner' ? 'owner' : user.role === 'admin' ? 'admin' : 'home');
}

function handleSignup(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get('email')).toLowerCase().trim();

  if (state.users.some((user) => user.email.toLowerCase() === email)) {
    return toast('এই ইমেইল দিয়ে অ্যাকাউন্ট আছে', 'error');
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: String(form.get('name')).trim(),
    email,
    password: String(form.get('password')),
    role: 'user',
    status: 'active',
    joinedAt: new Date().toISOString().slice(0, 10)
  };

  state.users = [...state.users, newUser];
  state.currentUser = newUser;
  toast('নতুন অ্যাকাউন্ট তৈরি হয়েছে');
  setRoute('home');
}

function handleUpload(event) {
  event.preventDefault();
  if (!canUpload(state.currentUser)) return toast('আপনার আপলোড করার অনুমতি নেই', 'error');

  const form = new FormData(event.currentTarget);
  const video = {
    id: crypto.randomUUID(),
    title: String(form.get('title')).trim(),
    creator: String(form.get('creator')).trim(),
    category: String(form.get('category')),
    thumbnail: String(form.get('thumbnail')).trim(),
    description: String(form.get('description')).trim(),
    views: Math.floor(Math.random() * 3000),
    status: String(form.get('status')),
    uploadedBy: state.currentUser.email,
    uploadedAt: new Date().toISOString().slice(0, 10)
  };

  state.videos = [video, ...state.videos];
  state.selectedVideoId = video.id;
  toast('ভিডিও আপলোড হয়েছে');
  setRoute('admin');
}

function render() {
  const page = state.route === 'auth' ? authPage() : state.route === 'admin' ? adminPage() : state.route === 'owner' ? ownerPage() : homePage();
  app.innerHTML = `${nav()}${page}`;
  bindEvents();
}

seedData();
render();
