# Learn-connect

This project is an MVP version of a multi-feature platform designed to enhance the online learning experience. It combines real-time chat capabilities, a quiz system for learning reinforcement, and an image gallery for sharing educational resources.
This project provides solid understanding of full-stack development, including front-end frameworks, back-end server handling, and real-time data processing.

## Note:

This project is a boilerplate and will be subject to change according to implemented features.

## Table of Contents

- [Features](#features)
- [Technical Stack](#technical-stack)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

1. **Real-Time Chat Application**:

- **Technology**: Socket.IO for real-time communication.

- **Features**:

  - User authentication and authorization. Users can add friends, remove connections, or block specific users, with socket delivering immediate updates.
  - Real-time messaging with typing indicators and message receipts.
  - Chat history saved in a database (MongoDB).

2. **Quiz Application**:

- **Technology**: Node.js for back-end, React.js for the front-end.

- **Features**:
  - Shuffled choices on exam start.
  - Timed exams: server-side timer reflected in UI. 
  - Immediate notification feedback on quiz score.
  - Admin priviliges for adding, editing and deleting quiz questions.
  - Classroom enrollment and access to classroom quizzes. Classroom and user quizzes, as well as the exam feedback stored in database (MongoDB).


## **Technical Stack**:

- **Front-end**:

  - HTML, CSS, Javascript
  - React.js for building interactive UIs
  - Dropzone.js for image uploads

- **Back-end**:

  - Node.js with Express.js for server-side logc
  - Socket.IO for real-time features
  - MongoDB for storing persistent user data: chat history, quiz questions, and exam feedback

## Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/martin-markovic/learn-connect.git
   cd learn-connect
   ```

2. **Install dependencies:**

   ```sh
   npm install

   cd frontend
   npm install
   ```

3. **Set up development environment variables:**

   Create a `.env` file in the root directory and add the following:

   ```env

   # MongoDB connection URI
   MONGODB_URI=your_mongodb_uri

   # Server configuration
   SERVER_PORT=your_port_number
   DATABASE_NAME=your_database_name
   NODE_ENV=development

   # JWT secret key for authentication
   JWT_SECRET=your_jwt_secret

   # Cloudinary credentials for image upload
   CLOUDINARY_CLOUD_NAME=<your_cloud_name>
   CLOUDINARY_API_KEY=<your_api_key>
   CLOUDINARY_API_SECRET=<your_api_secret>

   ```   

4. **Start the server:**

   ```sh
   npm run server
   ```

5. **Start the client:**

   ```sh
   cd frontend
   npm run client
   ```

6. Navigate to http://localhost:8000


## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (git checkout -b feature/your-feature-name).
3. Commit your changes (git commit -m 'Add some feature').
4. Push to the branch (git push origin feature/your-feature-name).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any questions or feedback, please reach out via martin730036@gmail.com.
