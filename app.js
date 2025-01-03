const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(express.json());

// Dummy data store
let users = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "user", created_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin", created_at: "2024-01-02T00:00:00Z" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "user", created_at: "2024-01-03T00:00:00Z" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", role: "user", created_at: "2024-01-04T00:00:00Z" },
  { id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "moderator", created_at: "2024-01-05T00:00:00Z" }
];

let posts = [
  { id: 1, user_id: 1, title: "First Post", content: "Hello World!", status: "published", created_at: "2024-01-01T00:00:00Z" },
  { id: 2, user_id: 1, title: "Second Post", content: "Another post", status: "draft", created_at: "2024-01-02T00:00:00Z" },
  { id: 3, user_id: 2, title: "Welcome", content: "Introduction post", status: "published", created_at: "2024-01-03T00:00:00Z" }
];

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Enhanced Sample API",
      version: "1.0.0",
      description: "An enhanced sample API with realistic endpoints and Swagger documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         role:
 *           type: string
 *           description: The role of the user
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was created
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns a list of users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter users by role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current_page:
 *                       type: integer
 *                     per_page:
 *                       type: integer
 */
app.get("/api/users", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const role = req.query.role;

  let filteredUsers = [...users];
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  res.json({
    data: paginatedUsers,
    pagination: {
      total: filteredUsers.length,
      pages: Math.ceil(filteredUsers.length / limit),
      current_page: page,
      per_page: limit
    }
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
app.get("/api/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
app.post("/api/users", (req, res) => {
  const { name, email, role = "user" } = req.body;
  const newUser = {
    id: users.length + 1,
    name,
    email,
    role,
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
app.put("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const updatedUser = {
    ...users[userIndex],
    ...req.body,
    id: userId  // Ensure ID doesn't change
  };

  users[userIndex] = updatedUser;
  res.json(updatedUser);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
app.delete("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
});

/**
 * @swagger
 * /api/users/{id}/posts:
 *   get:
 *     summary: Get posts by user ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user's posts
 *       404:
 *         description: User not found
 */
app.get("/api/users/:id/posts", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const userPosts = posts.filter(post => post.user_id === userId);
  res.json(userPosts);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Server Startup
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});