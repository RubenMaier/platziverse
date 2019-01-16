# modulo 8 

## video 1

## video 2
podemos usar el comando "curl" para hacer peticiones http desde consola en sistemas unix o mac
otra es instalar httpie.org, en este caso usamos este, y se ejecuta lo siguiente
- http http://localhost:3000/api/metrics/yyy-yyy/memory

## video 3
corremos la consulta con el id yyy valido y el id yyyz invalido, para ver el manejo de errores
http http://localhost:3000/api/agent/yyy

## modulo 9 JWT

## video 1
corremos npm run start-dev-SO
tiramos en otra consola el comando:
curl -v http://localhost:3000/api/agents
y nos debe decir que es un Token invalido

luego con el comando siguiente debe ser valido: (esto creo que se hace con httpie no con curl, en curl con win no me funco)

http http://localhost:3000/api/agents 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJ1YmVubWFpZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.Cm3Ud5Zi5XokjKjp_lQ7BwlvGW7ioiz3OsBOdjx3Nnw'

aunque debe ser vacio porque esta seteado con el usuario rubenmaier y key platzi

ahora con el token admin si me debe traer todo...

http http://localhost:3000/api/agents 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJ1YmVubWFpZXIiLCJhZG1pbiI6InBsYXR6aSIsImlhdCI6MTUxNjIzOTAyMn0.JUtjBdpy7S5SqHojmN6Vja-zjmUepOA62-LKUtRMjCI'

otro con usuario valido (username: ruben):

http http://localhost:3000/api/agents 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJ1YmVuIiwiaWF0IjoxNTE2MjM5MDIyfQ.EzRTS5haTJsuexh0DzjRVUTYs0ZoMmMI7md7VncQayw'