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

// Initialiser la base de données avec les données de test EXACTES de la photo
function initializeDatabase() {
  const countQuery = 'SELECT COUNT(*) as count FROM cars';
  
  db.get(countQuery, (err, row) => {
    if (err) {
      console.error('❌ Erreur lors du comptage des voitures:', err.message);
      return;
    }
    
    if (row.count === 0) {
      console.log('📦 La base de données est vide, insertion des données de la photo...');
      const testCars = [
        {
          brand: 'McLaren',
          model: 'p1',
          year: 2026,
          color: 'Noir',
          price: 45000000,
          mileage: 10,
          description: 'Pas de description',
          imageUrl: 'https://cdn.motor1.com/images/mgl/o7709/s1/mclaren-p1.jpg',
          highlights: 'Hypercar'
        },
        {
          brand: 'Citroen',
          model: 'c3',
          year: 2015,
          color: 'Grise',
          price: 4500,
          mileage: 250000,
          description: 'La voiture du peuple. Attention, elle en a sous le capot',
          imageUrl: 'https://cdn.wheel-size.com/automobile/body/citroen-c3-2013-2015-1627380267.7414687.jpg',
          highlights: 'Légendaire, moteur V12'
        },
        {
          brand: 'Renault',
          model: 'Clio 2',
          year: 2003,
          color: 'Blanc',
          price: 800,
          mileage: 350000,
          description: 'Une carcasse. Ne jouez pas au malin avec le conducteur',
          imageUrl: 'https://img.leboncoin.fr/api/v1/lbcpb1/images/64/9f/e0/649fe0857f41fedcc79c37ba04ba109e0eb2d482.jpg?rule=classified-1200x800-webp',
          highlights: 'Aileron emblématique'
        },
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
      
      console.log('✅ Données de test insérées (McLaren, Citroen, Renault)');
    } else {
      console.log(`✅ Base de données contient ${row.count} voiture(s)`);
    }
  });
}

// ==================== ROUTES API ====================

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

app.get('/api/cars/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM cars WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (!row) return res.status(404).json({ error: 'Voiture non trouvée' });
    res.json(row);
  });
});

app.post('/api/cars', (req, res) => {
  const { brand, model, year, color, price, mileage, description, imageUrl, highlights } = req.body;
  if (!brand || !model || !year) return res.status(400).json({ error: 'Veuillez fournir brand, model et year' });
  const query = `INSERT INTO cars (brand, model, year, color, price, mileage, description, imageUrl, highlights) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(query, [brand, model, year, color, price, mileage, description, imageUrl, highlights], function(err) {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.status(201).json({ id: this.lastID, ...req.body });
  });
});

app.put('/api/cars/:id', (req, res) => {
  const { id } = req.params;
  const { brand, model, year, color, price, mileage, description, imageUrl, highlights } = req.body;
  const query = `UPDATE cars SET brand=?, model=?, year=?, color=?, price=?, mileage=?, description=?, imageUrl=?, highlights=? WHERE id=?`;
  db.run(query, [brand, model, year, color, price, mileage, description, imageUrl, highlights, id], function(err) {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (this.changes === 0) return res.status(404).json({ error: 'Voiture non trouvée' });
    res.json({ id, ...req.body });
  });
});

app.delete('/api/cars/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM cars WHERE id = ?';
  db.run(query, [id], function(err) {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (this.changes === 0) return res.status(404).json({ error: 'Voiture non trouvée' });
    res.json({ message: 'Voiture supprimée avec succès' });
  });
});

app.use(express.static(path.join(__dirname, 'front')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚗 Serveur API Cars démarré sur http://localhost:${PORT}`);
});
