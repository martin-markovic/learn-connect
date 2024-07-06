# Learn-connect

This project is a multi-feature platform designed to enhance the online learning experience. It combines real-time chat capabilities, a quiz system for learning reinforcement, and an image gallery for sharing educational resources.
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

  - User authentication and authorization.
  - Real-time messaging with typing indicators and messeage receipts.
  - Group chat functionality for class discussions.
  - Chat history saved in a database (MongoDB).

2. **Quiz Application**:

- **Technology**: Node.js for back-end, React.js for the front-end.
- **Features**:
  - Multiple-choice quizzes on various educational topics.
  - Timed quizzes and immediate feedback on answers.
  - Score tracking and leaderboards.
  - Admin interface for adding, editing and deleting quiz questions.

3. **Image Gallery**:

- **Technology**: Dropzone.js for file uploading, Reactj.js for the front-end, Node.js for the back-end.

- **Features**:

  - User authentication to manage who can upload and view iamges.
  - Image upladodoing with drag-and-drop funcitonality.
  - Categorize and tag images for easy searching and organization.
  - Ability to comment on and like imges.
  - Image metadata storage and retrieval from a database.

## **Technical Stack**:

- **Front-end**:

  - HTML, CSS, Javascript
  - React.js for building interactive UIs
  - Dropzone.js for image uploads

- **Back-end**:

  - Node.js with Express.js for server-side logc
  - Socket.IO for real-time chat functionalitu
  - MongoDB for storing user data, chat history, quiz questions, and images
  - Firebase for optional real-time database and authentication features

## Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/martin-markovic/learn-connect.git
   cd learn-connect
   ```

2. **Install dependencies:**

   ```sh
   npm install express
   ```

3. **Set up development environment variables:**

   Create a `.env` file in the root directory and add the following:

   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   ```   

4. **Start the server:**

   ```sh
   npm run server
   ```

5. **Start the client:**

   ```sh
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
