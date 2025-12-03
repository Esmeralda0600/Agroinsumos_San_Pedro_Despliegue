function showToast(message, type = "info") {
    const cont = document.getElementById("toastContainer");

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    cont.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}
