FROM golang:1.23.3

WORKDIR /app

COPY go.mod ./

RUN go mod download

COPY . .

RUN go build -o main .

EXPOSE 5000

CMD ["./main"]