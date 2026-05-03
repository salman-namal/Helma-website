document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("careerForm");

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    alert("Application submitted successfully!");
  });

  document.querySelectorAll(".apply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("apply").scrollIntoView({
        behavior: "smooth"
      });
    });
  });

});
