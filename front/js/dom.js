// ========================
// dom.js
// ========================
// Toutes les fonctions de manipulation du DOM

/**
 * Crée une carte de voiture
 * @param {Object} car - Les données de la voiture
 * @returns {HTMLElement} L'élément article
 */
export const createCarCard = (car) => {
	// Article principal
	const article = document.createElement("article");
	article.className = "card";

	// Lien contenant l'image
	const imageLink = document.createElement("a");
	imageLink.href = `car.html?id=${car.id}`;
	const img = document.createElement("img");
	img.src = car.imageUrl || "https://via.placeholder.com/300x200?text=No+Image";
	img.alt = `${car.brand} ${car.model}`;
	img.className = "card-img-top";
	imageLink.appendChild(img);

	// Corps de la carte
	const cardBody = document.createElement("div");
	cardBody.className = "card-body";

	// Titre
	const title = document.createElement("h5");
	title.className = "card-title";
	title.textContent = `${car.brand} ${car.model}`;

	// Description
	const description = document.createElement("p");
	description.className = "card-text";
	description.textContent = car.highlights || "Classic car";

	// Conteneur pour les boutons
	const buttonContainer = document.createElement("div");
	buttonContainer.className = "d-flex gap-2";

	// Bouton "See more"
	const button = document.createElement("a");
	button.href = `car.html?id=${car.id}`;
	button.className = "btn btn-primary flex-grow-1";
	button.textContent = "See more";

	// Bouton de suppression
	const deleteBtn = document.createElement("button");
	deleteBtn.type = "button";
	deleteBtn.className = "btn btn-danger delete-btn";
	deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
	deleteBtn.title = "Supprimer cette voiture";

	// Assembler les boutons
	buttonContainer.appendChild(button);
	buttonContainer.appendChild(deleteBtn);

	// Assembler le corps
	cardBody.appendChild(title);
	cardBody.appendChild(description);
	cardBody.appendChild(buttonContainer);

	// Assembler l'article complet
	article.appendChild(imageLink);
	article.appendChild(cardBody);

	// Ajouter l'ID de la voiture comme data attribute
	article.dataset.carId = car.id;

	return article;
};

/**
 * Affiche toutes les voitures sur la page
 * @param {Array} cars - Tableau de voitures à afficher
 */
export const displayCars = (cars) => {
	const container = document.querySelector(".card-cont");

	// Vider le conteneur
	container.innerHTML = "";

	// Vérifier que nous avons des voitures
	if (!cars || cars.length === 0) {
		const message = document.createElement("p");
		message.className = "text-center text-muted my-5";
		message.textContent = "Aucune voiture disponible pour le moment.";
		container.appendChild(message);
		return;
	}

	// Utiliser DocumentFragment pour améliorer la performance
	const fragment = document.createDocumentFragment();

	// Créer une carte pour chaque voiture
	cars.forEach((car) => {
		const card = createCarCard(car);
		fragment.appendChild(card);
	});

	// Ajouter tous les éléments au DOM en une seule opération
	container.appendChild(fragment);
};

/**
 * Affiche un spinner de chargement
 * @param {HTMLElement} container - Le conteneur à remplir
 */
export const showLoading = (container) => {
	container.innerHTML = `
		<div class="text-center my-5">
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Chargement...</span>
			</div>
			<p class="mt-3">Chargement des voitures...</p>
		</div>
	`;
};

/**
 * Affiche un message d'erreur
 * @param {HTMLElement} container - Le conteneur à remplir
 * @param {string} message - Le message d'erreur
 */
export const showError = (container, message) => {
	container.innerHTML = "";
	const alert = document.createElement("div");
	alert.className = "alert alert-danger";
	alert.role = "alert";
	alert.innerHTML = `
		<h4 class="alert-heading">Erreur!</h4>
		<p>${message}</p>
	`;
	container.appendChild(alert);
};

/**
 * Affiche un message de succès
 * @param {HTMLElement} container - Le conteneur
 * @param {string} message - Le message
 */
export const showSuccess = (container, message) => {
	const alert = document.createElement("div");
	alert.className = "alert alert-success alert-dismissible fade show";
	alert.setAttribute("role", "alert");
	alert.innerHTML = `
		${message}
		<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
	`;
	container.insertAdjacentElement("beforebegin", alert);

	// Supprimer après 5 secondes
	setTimeout(() => {
		alert.remove();
	}, 5000);
};

/**
 * Affiche les détails d'une voiture
 * @param {Object} car - Les données de la voiture
 */
export const displayCarDetails = (car) => {
	// Titre
	const titleElement = document.querySelector("h2");
	titleElement.textContent = `${car.brand} ${car.model}`;

	// Image
	const imgElement = document.querySelector(".detail-image");
	imgElement.src = car.imageUrl || "https://via.placeholder.com/400x300?text=No+Image";
	imgElement.alt = `${car.brand} ${car.model}`;

	// Tableau des détails
	const tbody = document.querySelector("tbody");
	tbody.innerHTML = `
		<tr>
			<th>Année</th>
			<td>${car.year}</td>
		</tr>
		<tr>
			<th>Couleur</th>
			<td>${car.color}</td>
		</tr>
		<tr>
			<th>Kilométrage</th>
			<td>${new Intl.NumberFormat("fr-FR").format(car.mileage)} km</td>
		</tr>
		<tr>
			<th>Prix</th>
			<td>${new Intl.NumberFormat("fr-FR", {
				style: "currency",
				currency: "EUR"
			}).format(car.price)}</td>
		</tr>
		${car.description ? `<tr><th>Description</th><td>${car.description}</td></tr>` : ""}
	`;
};
