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