DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS moods;

CREATE TABLE users (
    id INTEGER NOT NULL
        CONSTRAINT user_pk PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL
        CONSTRAINT username_unique UNIQUE,
    email TEXT NOT NULL
        CONSTRAINT email_unique UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL
);

CREATE TABLE moods (
    id INTEGER NOT NULL
        CONSTRAINT moods_pk PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL
        CONSTRAINT moods_users_id_fk REFERENCES users,
    image_path TEXT NOT NULL,
    mood TEXT NOT NULL,
    timestamp TEXT NOT NULL
); 