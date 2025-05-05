fetch("../../views/templates/footer.html")
  .then((response) => {
    return response.text();
  })
  .then((data) => {
    document.querySelector("footer").innerHTML = data;
	const currentYear = new Date().getFullYear();
	document.getElementById("currentYear").textContent = currentYear;
  });