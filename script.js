
// ==========================================
// iamrudhh. — Blog Organiser
// Loads blogs.json and renders categories + posts
// ==========================================

const navEl = document.getElementById("nav-links");
const titleEl = document.getElementById("page-title");
const descEl = document.getElementById("page-description");
const countEl = document.getElementById("blog-count");
const listEl = document.getElementById("blog-list");

// Check if required HTML elements exist
if (!navEl || !titleEl || !descEl || !countEl || !listEl) {
    console.error("Blog Organiser: Required HTML elements not found.");
}

// Validate article URLs
function safeUrl(url) {
    try {
        const parsedUrl = new URL(url);

        if (
            parsedUrl.protocol === "https:" ||
            parsedUrl.protocol === "http:"
        ) {
            return parsedUrl.href;
        }

        return null;
    } catch {
        return null;
    }
}

// Create HTML elements safely
function el(tag, className, text) {
    const node = document.createElement(tag);

    if (className) {
        node.className = className;
    }

    if (text !== undefined) {
        node.textContent = text;
    }

    return node;
}

// ==========================================
// RENDER BLOG POSTS
// ==========================================

function renderPosts(posts) {
    listEl.replaceChildren();

    if (!posts.length) {
        listEl.appendChild(
            el("p", "empty", "No articles published yet.")
        );
        return;
    }

    posts.forEach(post => {

        // Validate URL, but don't skip posts without URLs
        const href = safeUrl(post.url);

        // Published = clickable card
        // Unpublished = normal card
        const card = el(
            href ? "a" : "div",
            "blog-card"
        );

        if (href) {
            card.href = href;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
        }

        // Post information
        card.append(
            el("div", "blog-meta", post.day || ""),
            el("div", "blog-title", post.title || "Untitled"),
            el("div", "blog-description", post.description || "")
        );

        // Article status
        if (href) {
            card.appendChild(
                el("span", "read-more", "READ ARTICLE ↗")
            );
        } else {
            card.appendChild(
                el("span", "read-more", "COMING SOON")
            );
        }

        listEl.appendChild(card);
    });
}

// ==========================================
// SHOW SELECTED CATEGORY
// ==========================================

function showCategory(category, link) {

    // Update active sidebar item
    navEl.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    link.classList.add("active");

    // Get category posts
    const posts = Array.isArray(category.posts)
        ? category.posts
        : [];

    // Update page content
    titleEl.textContent = category.title || "Untitled Category";

    descEl.textContent = category.description || "";

    // Update total post count
    countEl.textContent =
        String(posts.length).padStart(2, "0") + " POSTS";

    // Render every post
    renderPosts(posts);

    // Update URL hash
    history.replaceState(
        null,
        "",
        "#" + encodeURIComponent(category.id)
    );
}

// ==========================================
// LOAD BLOG DATA
// ==========================================

async function init() {

    try {

        // Load JSON data
        const response = await fetch("blogs.json", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }

        const data = await response.json();

        const categories = Array.isArray(data.categories)
            ? data.categories
            : [];

        // Clear existing sidebar
        navEl.replaceChildren();

        if (!categories.length) {
            listEl.appendChild(
                el("p", "empty", "No categories found.")
            );
            return;
        }

        // Create sidebar categories
        categories.forEach((category, index) => {

            const link = el(
                "a",
                "nav-item",
                "/ " + (category.title || "Untitled")
            );

            link.href = "#" + encodeURIComponent(category.id || "");

            link.addEventListener("click", event => {
                event.preventDefault();
                showCategory(category, link);
            });

            navEl.appendChild(link);

            // Open first category by default
            if (index === 0) {
                showCategory(category, link);
            }
        });

    } catch (error) {

        console.error("Blog loading error:", error);

        listEl.replaceChildren();

        listEl.appendChild(
            el(
                "p",
                "empty",
                "Failed to load blogs.json. Check your JSON file and deployment."
            )
        );
    }
}

// ==========================================
// START BLOG ORGANISER
// ==========================================

init();
