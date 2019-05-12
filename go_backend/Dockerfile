# Multi-stage builds

# building
FROM golang:1 as builder
WORKDIR /src/
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o go_backend .

# actual image
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app/
COPY --from=builder /src/go_backend .
CMD ["./go_backend"]
