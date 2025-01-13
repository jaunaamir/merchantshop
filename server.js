const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();
const port = 3000;

// Setup storage directory and file naming
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads')); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep original file name
    }
});

// Configure multer for file handling
const upload = multer({ storage });

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Initialize products array from a JSON file
let products = [];
const productsFilePath = path.join(__dirname, 'products.json');

if (fs.existsSync(productsFilePath)) {
    products = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
}

// Endpoint for handling file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    const product = req.body;
    if (req.file) {
        product.image = `/uploads/${req.file.originalname}`;
    }

    products.push(product);
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

    res.send('Product added successfully');
});

// Endpoint to get all products
app.get('/products', (req, res) => {
    res.json(products);
});

// Endpoint to delete a product
app.post('/delete-product', (req, res) => {
    const { index, confirmKey } = req.body;
    if (confirmKey === '7897836') {
        products.splice(index, 1);
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
        res.send('Product deleted successfully');
    } else {
        res.status(400).send('Invalid key');
    }
});

// Endpoint to delete all products
app.post('/delete-all-products', (req, res) => {
    const { confirmKey } = req.body;
    if (confirmKey === '7897836') {
        products = [];
        fs.writeFileSync(productsFilePath, JSON.stringify([]));
        res.send('All products deleted successfully');
    } else {
        res.status(400).send('Invalid key');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
