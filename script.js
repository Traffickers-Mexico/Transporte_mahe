document.getElementById("year").textContent = new Date().getFullYear();

const navToggle = document.getElementById("navToggle");
const header = document.querySelector(".site-header");

navToggle.addEventListener("click", () => {
  header.classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => header.classList.remove("open"));
});

const toggleScrolledHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
};
toggleScrolledHeader();
window.addEventListener("scroll", toggleScrolledHeader);

const quoteForm = document.getElementById("quoteForm");
if (quoteForm) {
  const errBox = document.getElementById("formError");
  const successBox = document.getElementById("formSuccess");
  const submitBtn = document.getElementById("formSubmit");

  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.classList.add("hidden");
    successBox.classList.add("hidden");

    const data = {
      nombre: quoteForm.nombre.value.trim(),
      empresa: quoteForm.empresa.value.trim(),
      telefono: quoteForm.telefono.value.trim(),
      email: quoteForm.email.value.trim(),
      empleados: quoteForm.empleados.value.trim(),
      turnos: quoteForm.turnos.value.trim(),
      ubicaciones: quoteForm.ubicaciones.value.trim(),
      tipo_servicio: quoteForm.tipo_servicio.value.trim(),
      fecha: quoteForm.fecha.value,
      mensaje: quoteForm.mensaje.value.trim(),
    };

    if (!data.nombre || !data.empresa || !data.telefono || !data.email) {
      errBox.textContent = "Por favor completa nombre, empresa, teléfono y correo.";
      errBox.classList.remove("hidden");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("server");
      successBox.classList.remove("hidden");
      quoteForm.reset();
    } catch {
      errBox.textContent = "Hubo un problema al enviar. Escríbenos por WhatsApp.";
      errBox.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar solicitud";
    }
  });
}
