export const showToast = (message, type = "success") => {
  // Get or create the global toast container at the bottom-right
  const container = document.getElementById("toast-container") || (() => {
    const el = document.createElement("div");
    el.id = "toast-container";
    el.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(el);
    return el;
  })();

  // Create the toast bubble
  const toast = document.createElement("div");
  toast.className = `px-4 py-3 rounded-lg shadow-xl border flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform translate-y-5 opacity-0 ${
    type === "success" 
      ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50" 
      : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
  }`;
  toast.innerText = message;
  container.appendChild(toast);

  // Animate slide-up and fade-in
  setTimeout(() => {
    toast.classList.remove("translate-y-5", "opacity-0");
  }, 10);

  // Animate slide-down, fade-out, and remove from DOM after 3 seconds
  setTimeout(() => {
    toast.classList.add("translate-y-5", "opacity-0");
    setTimeout(() => {
      toast.remove();
      if (container.childNodes.length === 0) {
        container.remove(); // Remove parent container if empty
      }
    }, 300);
  }, 3000);
};
