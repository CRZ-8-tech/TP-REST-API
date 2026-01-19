const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à la base de données
const dbPath = path.resolve(__dirname, 'cars.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('✅ Connecté à la base de données SQLite');
  }
});

// Créer la table si elle n'existe pas
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT,
    price REAL,
    mileage INTEGER,
    description TEXT,
    imageUrl TEXT,
    highlights TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error('❌ Erreur lors de la création de la table:', err.message);
  } else {
    console.log('✅ Table "cars" créée ou déjà existante');
    // Insérer des données de test si la table est vide
    initializeDatabase();
  }
});

// Initialiser la base de données avec les données de test
function initializeDatabase() {
  const countQuery = 'SELECT COUNT(*) as count FROM cars';
  
  db.get(countQuery, (err, row) => {
    if (err) {
      console.error('❌ Erreur lors du comptage des voitures:', err.message);
      return;
    }
    
    if (row.count === 0) {
      console.log('📦 La base de données est vide, insertion des données de test...');
      const testCars = [
        {
          brand: 'Ferrari',
          model: '250 GTO',
          year: 1962,
          color: 'Rouge',
          price: 45000000,
          mileage: 12000,
          description: 'Voiture de collection exceptionnelle',
          imageUrl: 'https://cdn.ferrari.com/cms/network/media/img/resize/5d055246107b060e8f527a59',
          highlights: 'Légendaire, moteur V12'
        },
        {
          brand: 'Porsche',
          model: '911 Carrera RS',
          year: 1973,
          color: 'Blanc',
          price: 850000,
          mileage: 45000,
          description: 'Légendaire modèle RS',
          imageUrl: 'https://cdn.rmsothebys.com/d/6/6/9/2/5/d669253bbebf27ce2a60ef8db2c46600610471d3.webp',
          highlights: 'Aileron emblématique'
        },
        {
          brand: 'Jaguar',
          model: 'E-Type',
          year: 1961,
          color: 'Bleu',
          price: 320000,
          mileage: 78000,
          description: 'Icône du design automobile',
          imageUrl: 'https://pendine.com/wp-content/uploads/2018/10/DSC_3137-WEB-1500x1001.jpg',
          highlights: 'Design révolutionnaire'
        }
      ];
      
      const insertQuery = `
        INSERT INTO cars (brand, model, year, color, price, mileage, description, imageUrl, highlights)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      testCars.forEach((car) => {
        db.run(insertQuery, [car.brand, car.model, car.year, car.color, car.price, car.mileage, car.description, car.imageUrl, car.highlights], (err) => {
          if (err) {
            console.error('❌ Erreur lors de l\'insertion:', err.message);
          }
        });
      });
      
      console.log('✅ Données de test insérées');
    } else {
      console.log(`✅ Base de données contient ${row.count} voiture(s)`);
    }
  });
}

// ==================== ROUTES API ====================

// GET /api/cars - Récupérer toutes les voitures
app.get('/api/cars', (req, res) => {
  const query = 'SELECT * FROM cars ORDER BY year DESC';
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des voitures:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(rows);
  });
});

// GET /api/cars/:id - Récupérer une voiture par ID
app.get('/api/cars/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM cars WHERE id = ?';
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération de la voiture:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }
    
    res.json(row);
  });
});

// POST /api/cars - Créer une voiture
app.post('/api/cars', (req, res) => {
  const { brand, model, year, color, price, mileage, description, imageUrl, highlights } = req.body;
  
  // Validation basique
  if (!brand || !model || !year) {
    return res.status(400).json({ error: 'Veuillez fournir brand, model et year' });
  }
  
  const query = `
    INSERT INTO cars (brand, model, year, color, price, mileage, description, imageUrl, highlights)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [brand, model, year, color, price, mileage, description, imageUrl, highlights], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la création de la voiture:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    res.status(201).json({ id: this.lastID, brand, model, year, color, price, mileage, description, imageUrl, highlights });
  });
});

// PUT /api/cars/:id - Mettre à jour une voiture
app.put('/api/cars/:id', (req, res) => {
  const { id } = req.params;
  const { brand, model, year, color, price, mileage, description, imageUrl, highlights } = req.body;
  
  const query = `
    UPDATE cars SET brand=?, model=?, year=?, color=?, price=?, mileage=?, description=?, imageUrl=?, highlights=?
    WHERE id=?
  `;
  
  db.run(query, [brand, model, year, color, price, mileage, description, imageUrl, highlights, id], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la mise à jour:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }
    
    res.json({ id, brand, model, year, color, price, mileage, description, imageUrl, highlights });
  });
});

// DELETE /api/cars/:id - Supprimer une voiture
app.delete('/api/cars/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM cars WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la suppression:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }
    
    res.json({ message: 'Voiture supprimée avec succès' });
  });
});

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'front')));

// Route par défaut
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚗 Serveur API Cars démarré sur http://localhost:${PORT}`);
  console.log(`📍 Frontend disponible sur http://localhost:${PORT}`);
  console.log(`📚 API disponible sur http://localhost:${PORT}/api/cars`);
});
