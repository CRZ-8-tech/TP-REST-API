// ========================
// js/script.js
// ========================
import { API_CONFIG } from "./config.js";

// --- 1. FONCTIONS API ---

async function fetchAllCars() {
    try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.cars}`);
        if (!response.ok) throw new Error("Erreur HTTP");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchCarById(id) {
    try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.carById(id)}`);
        if (response.status === 404) return null;
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function createCar(carData) {
    try {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.cars}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(carData)
        });
        if (!response.ok) throw new Error("Erreur ajout");
        return await response.json();
    } catch (error) {
        console.error("Erreur createCar:", error);
        alert("Erreur lors de l'ajout.");
        return null;
    }
}

async function deleteCar(id) {
    try {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.carById(id)}`;
        
        const response = await fetch(url, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Erreur lors de la suppression");
        return true; 
    } catch (error) {
        console.error("Erreur deleteCar:", error);
        alert("Impossible de supprimer la voiture.");
        return false; 
    }
}

// --- 2. FONCTIONS DOM ---

function showLoading(container) {
    if(container) container.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-primary"></div></div>';
}

function createCarCard(car) {
    const article = document.createElement('article');
    article.className = 'card shadow-sm position-relative'; 
    
    const imageUrl = (car.imageUrl && car.imageUrl.startsWith('http')) ? car.imageUrl : 'https://via.placeholder.com/300x200?text=No+Image';

    article.innerHTML = `
        <a href="car.html?id=${car.id}">
            <img src="${imageUrl}" class="card-img-top object-fit-fill" alt="${car.brand}">
        </a>
        <div class="card-body">
            <h5 class="card-title">${car.brand} ${car.model}</h5>
            <p class="card-text text-truncate">${car.description || 'Pas de description'}</p>
            
            <div class="d-flex justify-content-between align-items-center mt-3">
                <span class="fw-bold text-primary">${car.price} €</span>
                
                <div class="btn-group">
                    <a href="car.html?id=${car.id}" class="btn btn-sm btn-outline-primary">Détails</a>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-delete" data-id="${car.id}">
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    `;
    return article;
}

function displayCars(cars) {
    const container = document.querySelector('.card-cont');
    if (!container) return;
    container.innerHTML = ''; 
    if (!cars || cars.length === 0) {
        container.innerHTML = '<div class="alert alert-warning w-100 text-center">Aucune voiture disponible.</div>';
        return;
    }
    const fragment = document.createDocumentFragment();
    cars.forEach(car => fragment.appendChild(createCarCard(car)));
    container.appendChild(fragment);
}

function displayCarDetails(car, container) {
    if (!container) return;
    const imageUrl = (car.imageUrl && car.imageUrl.startsWith('http')) ? car.imageUrl : 'https://via.placeholder.com/600x400?text=No+Image';
    

    container.innerHTML = `
        <article class="p-5 text-center bg-body-tertiary rounded-3">
            <h2 class="text-body-emphasis mb-5">${car.year} ${car.brand} ${car.model}</h2>
            <div class="row">
                <div class="col-12 col-lg-6">
                    <img src="${imageUrl}" class="img-fluid rounded shadow-sm" alt="${car.model}">
                </div>
                <div class="col-12 col-lg-6 p-2 text-start">
                    <h3 class="mb-3">Spécifications</h3>
                    <table class="table table-striped">
                        <tbody>
                            <tr><th>Marque</th><td>${car.brand}</td></tr>
                            <tr><th>Modèle</th><td>${car.model}</td></tr>
                            <tr><th>Année</th><td>${car.year}</td></tr>
                            <tr><th>Prix</th><td class="fw-bold">${car.price} €</td></tr>
                        </tbody>
                    </table>
                    <div class="mt-4 d-flex justify-content-center gap-2">
                         <a class="btn btn-secondary" href="./index.html">Retour</a>
                         <button class="btn btn-danger btn-delete" data-id="${car.id}">Supprimer ce véhicule</button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

// --- 3. INITIALISATION ---

async function init() {
    const isDetailsPage = window.location.pathname.includes('car.html');
    const listContainer = document.querySelector('.card-cont');
    const detailContainer = document.querySelector('main .container'); // Pour car.html
    
    // --- GESTION SUPPRESSION (Event Delegation) ---

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id; // Récupère l'ID

            if (confirm("Êtes-vous sûr de vouloir supprimer cette voiture ? Action irréversible.")) {
                
                // 2. Appel API
                const success = await deleteCar(id);
                
                // 3. Mise à jour Interface [cite: 122]
                if (success) {
                    alert("Voiture supprimée !");
                    // Si on est sur l'accueil, on recharge la liste
                    if (!isDetailsPage && listContainer) {
                        const cars = await fetchAllCars();
                        displayCars(cars);
                    } 
                    // Si on est sur le détail, on renvoie vers l'accueil
                    else {
                        window.location.href = 'index.html';
                    }
                }
            }
        }
    });

    if (isDetailsPage) {
        // === PAGE DÉTAIL ===
        if(detailContainer) showLoading(detailContainer);
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            const car = await fetchCarById(id);
            if(car) displayCarDetails(car, detailContainer);
            else detailContainer.innerHTML = '<div class="alert alert-danger">Non trouvé.</div>';
        }
    } else {
        // === PAGE ACCUEIL ===
        if (listContainer) {
            showLoading(listContainer);
            const cars = await fetchAllCars();
            displayCars(cars);

            // Gestion Formulaire Ajout
            const form = document.getElementById('carForm'); 
            if (form) {
                form.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    if (!form.checkValidity()) {
                        form.classList.add('was-validated');
                        return;
                    }
                    const submitBtn = document.getElementById('submitCarBtn');
                    submitBtn.disabled = true;

                    const carData = {
                        brand: document.getElementById('brand').value,
                        model: document.getElementById('model').value,
                        year: parseInt(document.getElementById('year').value),
                        color: document.getElementById('color').value,
                        price: parseFloat(document.getElementById('price').value),
                        mileage: parseInt(document.getElementById('mileage').value),
                        description: document.getElementById('description').value,
                        imageUrl: document.getElementById('imageUrl').value
                    };

                    const newCar = await createCar(carData);
                    if (newCar) {
                        alert("Ajouté !");
                        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
                        if(modal) modal.hide();
                        form.reset(); 
                        form.classList.remove('was-validated');
                        const updatedCars = await fetchAllCars();
                        displayCars(updatedCars);
                    }
                    submitBtn.disabled = false;
                });
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', init);