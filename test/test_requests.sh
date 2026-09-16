curl -X POST http://localhost:4004/catalog/submitOrder \
  -H 'Content-Type: application/json' \
  -d '{"book":"b1000000-0000-0000-0000-000000000001","quantity":1}'

curl -X POST http://localhost:4004/catalog/submitOrder \
  -H 'Content-Type: application/json' \
  -d '{"book":"b1000000-0000-0000-0000-000000000002","quantity":1}'

curl -X POST http://localhost:4004/catalog/submitOrder \
  -H 'Content-Type: application/json' \
  -d '{"book":"b1000000-0000-0000-0000-000000000003","quantity":1}'

curl -X POST http://localhost:4004/catalog/submitOrder \
  -H 'Content-Type: application/json' \
  -d '{"book":"b1000000-0000-0000-0000-000000000003","quantity":1}'

curl -X POST http://localhost:4004/catalog/submitOrder \
  -H 'Content-Type: application/json' \
  -d '{"book":"b1000000-0000-0000-0000-000000000001","quantity":100}'

curl -X POST http://localhost:4004/catalog/submitOrder \
  -H 'Content-Type: application/json' \
  -d '{"book":"b1000000-0000-0000-0000-000000000001","quantity":100}'

curl -X POST http://localhost:4004/catalog/submitOrder \
  -H 'Content-Type: application/json' \
  -d '{"book":"b1000000-0000-0000-0000-000000000001","quantity":100}'

curl -X POST http://localhost:4004/catalog/submitOrder \
  -H 'Content-Type: application/json' \
  -d '{"book":"b1000000-0000-0000-0000-000000000003","quantity":1}'

curl -X POST http://localhost:4004/catalog/submitOrder \
  -H 'Content-Type: application/json' \
  -d '{"book":"b1000000-0000-0000-0000-000000000004","quantity":1}'

curl 'http://localhost:4004/catalog/Orders'