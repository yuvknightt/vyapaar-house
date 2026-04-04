# Vyapaar House · व्यापार भवन

> A vintage Indian textile marketplace powered by event-driven microservices.

**Live:** https://vyapaar-house.vercel.app

## Stack
- **Frontend:** React + Vite + Supabase Auth + Razorpay → Vercel
- **Backend:** Spring Boot 3 × 3 microservices → Render (Docker)
- **Messaging:** RabbitMQ (CloudAMQP)
- **Database:** PostgreSQL (Supabase)

## Flow
Order placed → RabbitMQ → Stock deducted + Email sent → Status updated

## Run locally
```bash
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
mvn clean install -DskipTests
cd order-service && mvn spring-boot:run
```
