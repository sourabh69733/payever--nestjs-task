# NestJS User Management Application

This project is a NestJS application for managing users, including creating users, retrieving user data, handling avatars, and sending emails.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.x or above)
- [MongoDB](https://www.mongodb.com/) (v4.4 or above)
- [RabbitMQ](https://www.rabbitmq.com/) (v3.7 or above)

### Environment Variables
Create a .env file in the root of the project and add the following environment variables:

There is one default .env file with cloud monogodb instance running
```
    MOGODB_URI=mongodb://localhost:27017/your-database
    RABBITMQ_URI=amqp://localhost:5672
```

## Steps

1. Install dependencies
```
yarn install
```
2. Install and start rabbitMQ server
```
./scripts/install-rabbitMq.sh
```
3. Start the server
```
yarn build
yarn start
```
4. To run test cases
```
yarn test
```

### API Endpoints

- POST /api/users

    Create a new user.

    ```
        curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"id": "1", "email":"goe.bluth@reqres.in","name":"George", "avatar":"https://reqres.in/img/faces/1-image.jpg"}'
    ```

- GET /api/user/{userId}

    Retrieve user data by ID.
    ```
        curl  http://localhost:3000/api/user/1
    ```

- GET /api/user/{userId}/avatar

    Retrieve the avatar image. If it's the first request, it will save the image and return its base64-encoded representation.
    ```
        curl  http://localhost:3000/api/user/1/avatar
    ```

- DELETE /api/user/{userId}/avatar

    Remove the avatar image and delete its record from the database.
    ```
        curl -X DELETE http://localhost:3000/api/user/1/avatar
    ```