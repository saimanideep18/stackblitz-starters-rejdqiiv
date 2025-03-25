// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

// Connect to MongoDB Atlas using the connection string from .env
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define the MenuItem Schema and Model
const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

// Initialize Express App
const app = express();
app.use(express.json());

// Add a new menu item (POST /menu)
app.post("/menu", async (req, res) => {
    try {
        const { name, description, price } = req.body;

        // Validation
        if (!name || !price) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        // Create and save new menu item
        const newMenuItem = new MenuItem({
            name,
            description,
            price,
        });

        const savedNewItem = await newMenuItem.save();

        // Successful response
        res.status(201).send("The new item is added successfully");
    } catch (error) {
        res.status(500).send(`Error adding a new item: ${error.message}`);
    }
});

// Update a menu item (PUT /menu/:id)
app.put('/menu/:id', async (req, res) => {
    try {
        const updatedItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document and validate inputs
        );

        if (!updatedItem) {
            return res.status(404).send('Menu item not found');
        }

        res.send(updatedItem);
    } catch (err) {
        res.status(400).send(`Error: ${err.message}`);
    }
});

// Delete a menu item (DELETE /menu/:id)
app.delete('/menu/:id', async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).send('Menu item not found');
        }

        res.send('Menu item deleted successfully');
    } catch (err) {
        res.status(400).send(`Error: ${err.message}`);
    }
});

// Start the Express server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});