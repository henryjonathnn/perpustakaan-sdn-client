-- Database initialization script
CREATE DATABASE IF NOT EXISTS perpustakaan_sdn;
USE perpustakaan_sdn;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('siswa', 'pustakawan') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: books
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(255) NOT NULL,
  description TEXT,
  cover_img VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_genre (genre),
  FULLTEXT KEY ft_search (title, author, genre, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default users
-- Password for both users: "password123"
-- Hash: $2a$10$OSkNsvXLi4inMt4F5mPKp.4fkBkuM1jKIpW9Ay9hJOdsQIVMVSaEq
INSERT INTO users (username, password, role) VALUES
('siswa1', '$2a$10$OSkNsvXLi4inMt4F5mPKp.4fkBkuM1jKIpW9Ay9hJOdsQIVMVSaEq', 'siswa'),
('pustakawan1', '$2a$10$OSkNsvXLi4inMt4F5mPKp.4fkBkuM1jKIpW9Ay9hJOdsQIVMVSaEq', 'pustakawan');

-- Insert sample books with cover images
INSERT INTO books (title, author, genre, description, cover_img) VALUES
('Harry Potter and the Half-Blood Prince', 'J.K. Rowling', 'Fantasy, Fiction, Magic, Childrens, Adventures', 'The war against Voldemort is not going well: even Muggle governments are noticing. Ron scans the obituary pages of The Daily Prophet looking for familiar names. Dumbledore is absent from Hogwarts for long stretches of time, and the Order of the Phoenix has already suffered losses.', 'harry-potter.jpg'),
('The Magicians', 'Lev Grossman', 'Fantasy, Fiction, Magic', 'Quentin discovers a magical school and enters a darker, more dangerous world than he imagined.', 'the-magicians.jpg'),
('A Wizard of Earthsea', 'Ursula K. Le Guin', 'Fantasy, Fiction, Magic, Adventure', 'Young wizard Ged faces the consequences of his pride and must confront the shadow he unleashed.', 'wizard-earthsea.jpg'),
('Fablehaven', 'Brandon Mull', 'Fantasy, Fiction, Magic, Childrens, Adventure', 'Siblings Kendra and Seth discover a sanctuary for magical creatures and face trials while escaping evil forces.', 'fablehaven.jpg'),
('Septimus Heap', 'Angie Sage', 'Fantasy, Fiction, Magic, Childrens', 'Septimus Heap, a boy with ancient magyk, must save the kingdom from dark forces.', 'septimus-heap.jpg'),
('Percy Jackson and the Lightning Thief', 'Rick Riordan', 'Fantasy, Fiction, Adventure, Childrens, Mythology', 'Percy Jackson discovers he is a demigod, the son of Poseidon. When Zeus lightning bolt is stolen, Percy must embark on a quest across America to prevent a war among the gods.', 'percy-jackson.jpg'),
('The Chronicles of Narnia', 'C.S. Lewis', 'Fantasy, Fiction, Magic, Childrens, Adventure', 'Four siblings discover a magical wardrobe that leads to the land of Narnia. They must help Aslan defeat the White Witch and restore peace.', 'chronicles-narnia.jpg'),
('Eragon', 'Christopher Paolini', 'Fantasy, Fiction, Adventure, Dragons', 'A young farm boy named Eragon finds a mysterious dragon egg. He is thrust into a world of magic and must battle against the tyrannical king.', 'eragon.jpg');