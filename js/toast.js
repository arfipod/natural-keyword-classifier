window.NKC_TOAST = (() => {
    function createToastController(container) {
        let toastId = 0;

        function showErrorToast(message) {
            const toast = document.createElement("div");
            const text = document.createElement("p");
            const closeButton = document.createElement("button");
            const id = toastId += 1;

            toast.className = "toast toast-error";
            toast.dataset.toastId = String(id);
            toast.setAttribute("role", "alert");
            text.textContent = message;
            closeButton.type = "button";
            closeButton.className = "toast-close";
            closeButton.setAttribute("aria-label", "Dismiss error");
            closeButton.textContent = "x";
            closeButton.addEventListener("click", () => dismissToast(toast));

            toast.append(text, closeButton);
            container.appendChild(toast);

            window.setTimeout(() => {
                dismissToast(toast);
            }, 6000);
        }

        function dismissToast(toast) {
            if (!toast || !toast.isConnected) {
                return;
            }

            toast.classList.add("is-hiding");
            window.setTimeout(() => {
                toast.remove();
            }, 180);
        }

        return { showErrorToast };
    }

    return { createToastController };
})();
