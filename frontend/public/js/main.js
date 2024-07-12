const socket = io("ws://localhost:8000");

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
  input.focus();
});

socket.on("chat message", (data) => {
  const item = document.createElement("li");
  item.textContent = data;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
