# FROM rust:1.81

# WORKDIR /app

# COPY Cargo.toml .
# COPY src ./src

# RUN cargo build --release

# EXPOSE 4001

# CMD ["./target/release/search-service"]
FROM rust:1.81

WORKDIR /app

COPY Cargo.toml .
COPY src ./src

RUN cargo build --release

EXPOSE 4001

CMD ["sh", "-c", "echo REMOTE_DATABASE_URL=$REMOTE_DATABASE_URL && ./target/release/search-service"]