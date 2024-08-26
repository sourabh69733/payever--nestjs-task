curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"id": "1", "email":"goe.bluth@reqres.in","name":"George", "avatar":"https://reqres.in/img/faces/1-image.jpg"}'

curl  http://localhost:3000/api/user/1

curl  http://localhost:3000/api/user/1/avatar

curl -X DELETE http://localhost:3000/api/user/1/avatar