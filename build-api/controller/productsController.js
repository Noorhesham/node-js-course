// Fake database for demonstration
const products = [
  { id: 1, name: "Product 1", description: "Description for Product 1" },
  { id: 2, name: "Product 2", description: "Description for Product 2" },
];

// Get all products
export const getAllProducts = (req, res) => {
  res.json(products);
};

// Create a new product
export const createProduct = (req, res) => {
  const newProduct = req.body;
  products.push({ id: products.length + 1, ...newProduct });
  res.status(201).json({ message: "Product created", product: newProduct });
};

// Get a single product by ID
export const getProductById = (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === parseInt(id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

// Delete a product
export const deleteProduct = (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === parseInt(id));
  if (index !== -1) {
    products.splice(index, 1);
    res.json({ message: `Product with ID ${id} deleted` });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

// Update a product
export const updateProduct = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const product = products.find((p) => p.id === parseInt(id));
  if (product) {
    Object.assign(product, updatedData);
    res.json({ message: "Product updated", product });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};
