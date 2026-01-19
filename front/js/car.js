import { localCarsdata } from "./mock-data.js"

// ==================== CONFIGURATION API ====================
const API_CONFIG = {
  // ⚠️ À REMPLACER par votre URL Render réelle
  baseURL: "http://localhost:3000",
  endpoints: {
    cars: "/api/cars",
    carById: (id) => `/api/cars/${id}`
  }
};

// ==================== FETCH FUNCTIONS ====================

/**
 * Récupère une voiture spécifique par son ID
 * @param {number|string} id - L'ID de la voiture
 * @returns {Promise<Object>} L'objet voiture ou null en cas d'erreur
 */
async function fetchCarById(id) {
  try {
    const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.carById(id)}`;
    console.log("Fetching car from:", url);
    
    const response = await fetch(url);
    
    // Gérer le cas 404 (voiture non trouvée)
    if (response.status === 404) {
      console.warn(`⚠️ Voiture avec ID ${id} non trouvée`);
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✅ Voiture récupérée:", data);
    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la voiture:", error);
    return null;
  }
}

// ==================== DOM MANIPULATION ====================

/**
 * Extrait l'ID depuis les paramètres de l'URL
 * @returns {string|null} L'ID de la voiture ou null
 */
function getCarIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number} num - Le nombre à formater
 * @returns {string} Le nombre formaté
 */
function formatNumber(num) {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Affiche les détails d'une voiture
 * @param {Object} car - L'objet voiture avec toutes les infos
 */
function displayCarDetails(car) {
  try {
    // Remplir le titre principal
    const titleElement = document.querySelector('article h2');
    if (titleElement) {
      titleElement.textContent = `${car.year} ${car.brand} ${car.model}`;
    }
    
    // Remplir l'image principale
    const imgElement = document.querySelector('article img');
    if (imgElement) {
      imgElement.src = car.imageUrl || './imgs/placeholder.png';
      imgElement.alt = `${car.year} ${car.brand} ${car.model}`;
    }
    
    // Remplir le tableau des spécifications
    const tbody = document.querySelector('table tbody');
    if (tbody) {
      // Créer les lignes du tableau
      tbody.innerHTML = `
        <tr>
          <th scope="row">Year</th>
          <td>${car.year || '-'}</td>
        </tr>
        <tr>
          <th scope="row">Make</th>
          <td>${car.brand || '-'}</td>
        </tr>
        <tr>
          <th scope="row">Model</th>
          <td colspan="2">${car.model || '-'}</td>
        </tr>
        <tr>
          <th scope="row">Color</th>
          <td colspan="2">${car.color || '-'}</td>
        </tr>
        <tr>
          <th scope="row">Mileage</th>
          <td colspan="2">${formatNumber(car.mileage) || '0'} km</td>
        </tr>
        <tr>
          <th scope="row">Description</th>
          <td colspan="2">${car.highlights || car.description || '-'}</td>
        </tr>
        <tr>
          <th scope="row">Price</th>
          <td colspan="2">${formatNumber(car.price) || '-'} €</td>
        </tr>
      `;
    }
    
    console.log("✅ Détails de la voiture affichés");
  } catch (error) {
    console.error("❌ Erreur lors de l'affichage des détails:", error);
    throw error;
  }
}

/**
 * Affiche un message d'erreur
 * @param {string} message - Le message d'erreur
 */
function showError(message) {
  const container = document.querySelector('main');
  container.innerHTML = '';
  
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger m-5';
  alert.role = 'alert';
  alert.innerHTML = `
    <h4 class="alert-heading">Erreur!</h4>
    <p>${message}</p>
    <hr>
    <p class="mb-0"><a href="./index.html" class="btn btn-primary">Retour à l'accueil</a></p>
  `;
  container.appendChild(alert);
}

/**
 * Affiche un spinner de chargement
 */
function showLoading() {
  const container = document.querySelector('main');
  const originalContent = container.innerHTML;
  
  container.innerHTML = `
    <div class="container text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <p class="mt-3">Chargement des détails de la voiture...</p>
    </div>
  `;
}

/**
 * Initialise la page de détail d'une voiture
 */
async function initCarPage() {
  try {
    // Récupérer l'ID depuis l'URL
    const carId = getCarIdFromURL();
    
    if (!carId) {
      showError('ID de voiture manquant dans l\'URL.');
      return;
    }
    
    // Afficher le chargement
    showLoading();
    
    // Récupérer les détails de la voiture
    const car = await fetchCarById(carId);
    
    if (!car) {
      showError(`La voiture avec l'ID ${carId} n'a pas été trouvée.`);
      return;
    }
    
    // Afficher les détails
    displayCarDetails(car);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la page:', error);
    showError('Une erreur est survenue lors du chargement des détails. Veuillez réessayer.');
  }
}

// ==================== INITIALISATION ====================

// Lancer l'initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', initCarPage);

console.log("✅ car.js chargé - Page de détail initialisée")
