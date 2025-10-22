const { Plugin, Notice, WorkspaceLeaf } = require('obsidian');

module.exports = class Imgur Gallery extends Plugin {
  onload() {
    console.log("✅ Imgur Gallery loaded!");

    this.addCommand({
      id: 'insert-gallery-block',
      name: 'Insert Gallery Block',
      callback: () => this.openGalleryModal()
    });
  }

  onunload() {
    console.log("🛑 Imgur Gallery unloaded!");
  }

  async openGalleryModal() {
    // mode selection
    const modes = ["gallery (auto-wrap)", "row (2–3 side by side)", "full (single large)", "tiny (small centered)"];
    const modeValues = ["gallery", "row", "full", "tiny"];
    const mode = await this.suggesterModal("Choose gallery mode", modes, modeValues);

    // multiline prompt for links
    const input = await this.multilinePrompt("Paste your image links", "One link per line...");

    if (!input) {
      new Notice("No links entered.");
      return;
    }

    // normalize Imgur links
    const links = input.split("\n").map(l => this.normalizeImgur(l)).filter(l => l.length > 0);

    // generate HTML
    const htmlLinks = links.map(link => `<a href="${link}"><img src="${link}" alt=""></a>`);
    const html = `<div class="${mode}">\n${htmlLinks.join("\n")}\n</div>`;

    // insert at cursor
    const leaf = this.app.workspace.activeLeaf;
    if (leaf && leaf.view && leaf.view.editor) {
      leaf.view.editor.replaceSelection(html);
    } else {
      new Notice("No active editor to insert gallery.");
    }
  }

  async suggesterModal(title, options, values) {
    return new Promise(resolve => {
      const modal = document.createElement("div");
      Object.assign(modal.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "9999"
      });

      const box = document.createElement("div");
      Object.assign(box.style, {
        background: "#1e1e1e",
        border: "1px solid #555",
        borderRadius: "12px",
        padding: "1rem",
        width: "400px",
        maxWidth: "90%",
        color: "#ddd"
      });
      box.innerHTML = `<h3 style="margin-top:0;">${title}</h3>`;

      options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        Object.assign(btn.style, {
          display: "block",
          margin: "6px 0",
          width: "100%",
          padding: "6px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          background: "#0078d4",
          color: "#fff"
        });
        btn.onclick = () => {
          document.body.removeChild(modal);
          resolve(values[i]);
        };
        box.appendChild(btn);
      });

      modal.appendChild(box);
      document.body.appendChild(modal);
    });
  }

  async multilinePrompt(title, placeholder) {
    return new Promise(resolve => {
      const modal = document.createElement("div");
      Object.assign(modal.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "9999"
      });

      const box = document.createElement("div");
      Object.assign(box.style, {
        background: "#1e1e1e",
        border: "1px solid #555",
        borderRadius: "12px",
        padding: "1rem",
        width: "500px",
        maxWidth: "90%",
        color: "#ddd"
      });
      box.innerHTML = `<h3 style="margin-top:0;">${title}</h3>`;

      const textarea = document.createElement("textarea");
      textarea.placeholder = placeholder;
      Object.assign(textarea.style, {
        width: "100%",
        height: "200px",
        background: "#2b2b2b",
        border: "1px solid #666",
        borderRadius: "8px",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: "0.9rem",
        padding: "8px"
      });

      const btn = document.createElement("button");
      btn.textContent = "Done";
      Object.assign(btn.style, {
        marginTop: "10px",
        padding: "6px 14px",
        borderRadius: "6px",
        border: "none",
        background: "#0078d4",
        color: "white",
        cursor: "pointer"
      });

      btn.onclick = () => {
        const value = textarea.value;
        document.body.removeChild(modal);
        resolve(value);
      };

      box.appendChild(textarea);
      box.appendChild(btn);
      modal.appendChild(box);
      document.body.appendChild(modal);
    });
  }

  normalizeImgur(url) {
    url = url.trim();
    if (!url) return "";
    if (url.startsWith("https://imgur.com/")) {
      const id = url.split("/").pop().replace(/\..+$/, "");
      return `https://i.imgur.com/${id}.jpeg`;
    }
    return url;
  }
};
