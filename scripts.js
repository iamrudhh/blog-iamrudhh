// Loads blogs.json and renders nav + cards.
// Uses textContent (no innerHTML) and only allows http/https links.

const navEl = document.getElementById("nav-links");
const titleEl = document.getElementById("page-title");
const descEl = document.getElementById("page-description");
const countEl = document.getElementById("blog-count");
const listEl = document.getElementById("blog-list");

function safeUrl(url) {
    try {
        const u = new URL(url);
        return (u.protocol === "https:" || u.protocol === "http:") ? u.href : null;
    } catch {
        return null;
    }
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function renderPosts(posts) {
    listEl.replaceChildren();

    if (!posts.length) {
        listEl.appendChild(el("p", "empty", "No articles published yet."));
        return;
    }

    posts.forEach(post => {
        const href = safeUrl(post.url);
        if (!href) return;

        const card = el("a", "blog-card");
        card.href = href;
        card.target = "_blank";
        card.rel = "noopener noreferrer";

        card.append(
            el("div", "blog-meta", post.day || ""),
            el("div", "blog-title", post.title || ""),
            el("div", "blog-description", post.description || ""),
            el("span", "read-more", "READ ARTICLE ↗")
        );
        listEl.appendChild(card);
    });
}

function showCategory(category, link) {
    navEl.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    link.classList.add("active");

    const posts = Array.isArray(category.posts) ? category.posts : [];
    titleEl.textContent = category.title;
    descEl.textContent = category.description || "";
    countEl.textContent = String(posts.length).padStart(2, "0") + " POSTS";
    renderPosts(posts);
}

async function init() {
    try {
        const res = await fetch("blogs.json", { cache: "no-cache" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        const categories = data.categories || [];

        categories.forEach((cat, i) => {
            const link = el("a", "nav-item", "/ " + cat.title);
            link.href = "#" + encodeURIComponent(cat.id);
            link.addEventListener("click", e => {
                e.preventDefault();
                showCategory(cat, link);
            });
            navEl.appendChild(link);
            if (i === 0) showCategory(cat, link);
        });

        if (!categories.length) listEl.appendChild(el("p", "empty", "No categories found."));
    } catch (err) {
        console.error(err);
        listEl.appendChild(el("p", "empty", "Failed to load blogs.json (run via a local server, not file://)."));
    }
}

init();
