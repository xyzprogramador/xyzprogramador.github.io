const BIN_ID = "686e7163bfd9ef6c1cb744c8";
const API_KEY = "$2a$10$vh/goyHXVUtDUj8Gh7nK6OpcUbDy5SsVMjF1A3pHVwOMY5CMODo62";
const postForm = document.getElementById('postForm');
const postsContainer = document.getElementById('posts');

const adminUsers = ["caique9014", "ZIP", "MutualDumbass"];
const adminPassword = "sfothlikers";
let isAdmin = false;

// Create password field (initially hidden)
const passwordInput = document.createElement("input");
passwordInput.type = "password";
passwordInput.id = "adminPassword";
passwordInput.placeholder = "Enter admin password";
passwordInput.style.display = "none";
postForm.insertBefore(passwordInput, postForm.querySelector('textarea'));

// Show password field for admin usernames
const usernameInput = document.getElementById('username');
usernameInput.addEventListener('input', () => {
  const uname = usernameInput.value.trim();
  if (adminUsers.includes(uname)) {
    passwordInput.style.display = "block";
  } else {
    passwordInput.style.display = "none";
    passwordInput.value = "";
  }
});

async function loadPosts() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY
      }
    });
    const data = await res.json();
    const posts = data.record.posts || [];

    postsContainer.innerHTML = '';
    posts.slice().reverse().forEach((post, index) => {
      const postDiv = document.createElement('div');
      postDiv.className = 'post';
      postDiv.innerHTML = `
        <div class="post-title">${post.title}</div>
        <div class="post-meta">Posted by ${post.user} on ${post.date}</div>
        <div class="post-content">${post.content}</div>
      `;

      if (isAdmin) {
        const delBtn = document.createElement('button');
        delBtn.textContent = "🗑️ Delete";
        delBtn.style.marginTop = "10px";
        delBtn.style.background = "#ff4444";
        delBtn.style.border = "2px solid #fff";
        delBtn.style.color = "#fff";
        delBtn.style.cursor = "pointer";
        delBtn.style.fontSize = "10px";
        delBtn.onclick = async () => {
          if (confirm("Are you sure you want to delete this post?")) {
            posts.splice(posts.length - 1 - index, 1);
            await savePosts(posts);
            loadPosts();
          }
        };
        postDiv.appendChild(delBtn);
      }

      postsContainer.appendChild(postDiv);
    });
  } catch (err) {
    console.error("Failed to load posts:", err);
  }
}

async function savePosts(posts) {
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify({ posts })
    });
  } catch (err) {
    console.error("Failed to save posts:", err);
  }
}

postForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = document.getElementById('username').value.trim();
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  const pwd = passwordInput.value.trim();

  if (!user || !title || !content) return;

  if (adminUsers.includes(user)) {
    if (pwd === adminPassword) {
      isAdmin = true;
    } else {
      alert("❌ Incorrect password for admin user.");
      return;
    }
  }

  const newPost = {
    user,
    title,
    content,
    date: new Date().toLocaleString()
  };

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY
      }
    });
    const data = await res.json();
    const posts = data.record.posts || [];

    posts.push(newPost);
    await savePosts(posts);

    postForm.reset();
    passwordInput.style.display = "none";
    loadPosts();
  } catch (err) {
    console.error("Failed to submit post:", err);
  }
});

// Load posts on first visit
loadPosts();
