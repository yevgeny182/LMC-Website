# Project README

## Overview

This project is a backend application designed to handle authentication and CRUD (Create, Read, Update, Delete) operations. It utilizes Node.js with Express as the server framework and MongoDB as the database for data storage. The front-end technologies used in developing this application follow the MEAN stack architecture.

### Technologies Used
- **Frontend**: 
  - **Angular**: A platform for building mobile and desktop web applications.
  - **Angular Material**: UI component library for Angular applications, providing a set of reusable components.

- **Backend**: 
  - **Node.js**: JavaScript runtime for building server-side applications.
  - **Express**: Web application framework for Node.js to handle routes and middleware.
  - **MongoDB**: NoSQL database for storing user and application data.
  - **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
  - **Environment Variables**: Managed using dotenv for configuration.

### MongoDB
- **Version**: 8.0.6
- **Cluster**: A MongoDB cluster was created to manage the database.
- **URI Connection**: The application connects to MongoDB using a connection string stored in environment variables for security.

## Features

### Authentication (AUTH)
- Implemented user authentication using JSON Web Tokens (JWT).
- Registration endpoint for new users.
- Login endpoint for existing users.
- Middleware to protect routes requiring authentication.

### CRUD Operations
- **Create**: Endpoint to create new resources (e.g., users, posts).
- **Read**: Endpoint to retrieve data (e.g., get user details, list all posts).
- **Update**: Endpoint to update existing resources.
- **Delete**: Endpoint to delete resources.

### Data Structure
- **Models**: Data is structured using Mongoose models, which define the schema for the collections in MongoDB.
  - Example models include `User`, `Post`, etc.
- **Routes**: Organized into separate route files to manage different functionalities. Each model has corresponding routes for CRUD operations.

## Setup and Installation

### Prerequisites
- Node.js (Version 14 or above)
- MongoDB (Version 8.0.6)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
