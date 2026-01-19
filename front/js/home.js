// ========================
// home.js
// ========================
// Logique spécifique à la page d'accueil (index.html)

import { fetchAllCars, createCar, deleteCar } from './api.js';
import { validateCarData } from './validation.js';
import {
	displayCars,
	showLoading,
	showError,
	showSuccess
} from './dom.js';

/**
 * Gère la soumission du formulaire
 * @param {Event} event - L'événement du formulaire
 */
const handleFormSubmit = async (event) => {
	event.preventDefault();

	const form = event.target;
	const submitBtn = document.getElementById("submitCarBtn");
	const formError = document.getElementById("formError");
	const carsCont = document.querySelector('.card-cont');

	try {
		// Réinitialiser le message d'erreur
		formError.classList.add("d-none");
		formError.textContent = "";

		// Récupérer les données du formulaire
		const formData = new FormData(form);
		const carData = {
			brand: formData.get("brand"),
			model: formData.get("model"),
			year: formData.get("year"),
			color: formData.get("color"),
			price: formData.get("price"),
			mileage: formData.get("mileage"),
			description: formData.get("description"),
			imageUrl: formData.get("imageUrl")
		};

		// Validation
		const { isValid, errors } = validateCarData(carData);
		if (!isValid) {
			formError.textContent = errors.join("\n");
			formError.classList.remove("d-none");
			return;
		}

		// Désactiver le bouton pendant la requête
		submitBtn.disabled = true;
		submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ajout...';

		// Préparation du payload
		const payload = {
			brand: carData.brand.trim(),
			model: carData.model.trim(),
			year: parseInt(carData.year),
			color: carData.color.trim(),
			price: parseFloat(carData.price),
			mileage: parseInt(carData.mileage),
			description: carData.description ? carData.description.trim() : "",
			imageUrl: carData.imageUrl
				? carData.imageUrl.trim()
				: "https://via.placeholder.com/300x200?text=No+Image"
		};

		// Créer la voiture
		const newCar = await createCar(payload);

		// Succès
		form.reset();
		formError.classList.add("d-none");

		// Fermer le modal
		const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
		modal.hide();

		// Afficher un message de succès
		showSuccess(carsCont, "Voiture ajoutée avec succès !");

		// Rafraîchir la liste
		const cars = await fetchAllCars();
		displayCars(cars);
	} catch (error) {
		// Afficher l'erreur
		formError.textContent = error.message;
		formError.classList.remove("d-none");
	} finally {
		// Réactiver le bouton
		submitBtn.disabled = false;
		submitBtn.innerHTML = "Ajouter la voiture";
	}
};

/**
 * Gère la suppression d'une voiture
 * @param {string|number} carId - L'ID de la voiture
 * @param {HTMLElement} cardElement - L'élément carte à supprimer
 */
const handleDeleteCar = async (carId, cardElement) => {
	const carsCont = document.querySelector('.card-cont');

	// Confirmation
	if (!confirm("Êtes-vous sûr de vouloir supprimer cette voiture ?")) {
		return;
	}

	try {
		// Ajouter une classe de chargement à la carte
		cardElement.classList.add("opacity-50");

		// Supprimer la voiture
		await deleteCar(carId);

		// Supprimer la carte avec une animation
		cardElement.style.opacity = "0";
		cardElement.style.transform = "scale(0.95)";
		setTimeout(() => {
			cardElement.remove();
			showSuccess(carsCont, "Voiture supprimée avec succès !");
		}, 300);
	} catch (error) {
		showError(carsCont, `Impossible de supprimer: ${error.message}`);
		// Réinitialiser l'apparence de la carte
		cardElement.classList.remove("opacity-50");
	}
};

/**
 * Initialise la page d'accueil
 */
export const initHome = async () => {
	const container = document.querySelector('.card-cont');

	try {
		// Afficher l'état de chargement
		showLoading(container);

		// Récupérer et afficher les voitures
		const cars = await fetchAllCars();
		displayCars(cars);

		// Ajouter les event listeners
		const carForm = document.getElementById('carForm');
		carForm.addEventListener('submit', handleFormSubmit);

		// Event delegation pour les boutons de suppression
		container.addEventListener('click', (e) => {
			if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
				const deleteBtn = e.target.closest('.delete-btn');
				const cardElement = deleteBtn.closest('article');
				const carId = cardElement.dataset.carId;
				handleDeleteCar(carId, cardElement);
			}
		});

		console.log('✅ Page d\'accueil initialisée');
	} catch (error) {
		console.error('Erreur lors de l\'initialisation:', error);
		showError(container, 'Impossible de charger les voitures. Veuillez rafraîchir la page.');
	}
};

// Lancer l'initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', initHome);
