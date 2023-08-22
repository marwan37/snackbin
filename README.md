# SnackBin - A RequestBin-like Web Application

SnackBin is a web application that allows users to create temporary endpoints (bins) to collect and inspect HTTP requests. It's a powerful tool for debugging webhooks, analyzing HTTP headers, payloads, and more.

## Table of Contents

1. [Features](#features)
2. [Technologies](#technologies)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Contributing](#contributing)
6. [License](#license)

## Features

- **Create Temporary Bins**: Generate unique endpoints to collect HTTP requests.
- **Inspect Requests**: View detailed information about requests, including headers, body, method, path, and query parameters.
- **GitHub Webhook Integration**: Handle GitHub webhook payloads.
- **Basecamp Integration**: Handle Basecamp payloads.
- **Analytics**: Analyze request patterns, popular methods, common paths, and more.
- **Queue Management**: Manage a queue of GitHub payloads.
- **Real-time Updates**: Utilize Socket.io for real-time updates.

## Technologies

- **Node.js**: Server-side JavaScript runtime.
- **Express**: Web application framework for Node.js.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **PostgreSQL**: Open-source relational database.
- **Docker**: Containerization platform.
- **Socket.io**: Real-time engine for web sockets.

## Installation

1. **Clone the Repository**:
```bash
git clone https://github.com/marwan37/snackbin.git
```

2. **Navigate to the Directory**:
```bash
cd snackbin
```

3. **Install Dependencies**:
```bash
npm install
```

4. **Build Docker Containers**:
```bash
docker-compose up --build
```

5. **Initialize Database**:
```sql
CREATE TABLE IF NOT EXISTS bins (
    id SERIAL PRIMARY KEY,
    endpoint_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    bin_id INT REFERENCES bins(id),
    headers JSON,
    body JSON,
    method VARCHAR(10),
    path VARCHAR(255),
    query JSON,
    created_at TIMESTAMP DEFAULT current_timestamp
);
```

## Usage

- **Create a New Bin**: `POST /api/bin/new`
- **Get Bin by ID**: `GET /api/bin/:id`
- **Delete a Request from a Bin**: `DELETE /api/bin/:id/:rid`
- **Handle GitHub Webhook Payload**: `POST /bin/:id/github-webhook`
- **Handle Basecamp Payload**: `POST /bin/:id/basecamp`
- **Get Basecamp Payloads**: `GET /api/bin/basecamp/:id`

## Contributing

Feel free to fork the repository, create a feature branch, and submit a pull request.

## License

This project is licensed under the MIT License.
