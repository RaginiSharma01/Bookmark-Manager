const saveBtn = document.getElementById("saveBtn");
const bookmarkList = document.getElementById("bookmarkList");
const searchInput = document.getElementById("search");
const categoryInput = document.getElementById("category");

function renderBookmarks(filter = "") {
  chrome.storage.sync.get(["bookmarks"], function(result) {
    const bookmarks = result.bookmarks || [];
    bookmarkList.innerHTML = "";

    bookmarks
      .filter(b => b.title.toLowerCase().includes(filter.toLowerCase()))
      .forEach(({ title, url, category }, index) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.textContent = title + (category ? ` [${category}]` : "");

        const delBtn = document.createElement("span");
        delBtn.textContent = "🗑️";
        delBtn.classList.add("delete");
        delBtn.addEventListener("click", () => deleteBookmark(index));

        li.appendChild(link);
        li.appendChild(delBtn);
        bookmarkList.appendChild(li);
      });
  });
}

function deleteBookmark(index) {
  chrome.storage.sync.get(["bookmarks"], function(result) {
    const bookmarks = result.bookmarks || [];
    bookmarks.splice(index, 1);
    chrome.storage.sync.set({ bookmarks }, renderBookmarks);
  });
}

saveBtn.addEventListener("click", () => {
  const category = categoryInput.value.trim();

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs[0];
    const bookmark = {
      title: tab.title,
      url: tab.url,
      category: category || ""
    };

    chrome.storage.sync.get(["bookmarks"], function(result) {
      const bookmarks = result.bookmarks || [];
      bookmarks.push(bookmark);
      chrome.storage.sync.set({ bookmarks }, () => {
        renderBookmarks();
        categoryInput.value = "";
      });
    });
  });
});

searchInput.addEventListener("input", (e) => {
  renderBookmarks(e.target.value);
});

document.addEventListener("DOMContentLoaded", () => renderBookmarks());
