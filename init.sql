-- Database initialization script
CREATE DATABASE IF NOT EXISTS perpustakaan_sdn;
USE perpustakaan_sdn;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('siswa', 'pustakawan') NOT NULL DEFAULT 'siswa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: genres
CREATE TABLE IF NOT EXISTS genres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: books
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre_id INT NOT NULL,
  synopsis TEXT,
  cover_img VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_author (author),
  FOREIGN KEY (genre_id) REFERENCES genres(id),
  FULLTEXT KEY ft_search (title, author, synopsis)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default users
-- Password for both users: "password123"
-- Hash: $2a$10$OSkNsvXLi4inMt4F5mPKp.4fkBkuM1jKIpW9Ay9hJOdsQIVMVSaEq
INSERT INTO users (username, password, role) VALUES
('siswa1', '$2a$10$OSkNsvXLi4inMt4F5mPKp.4fkBkuM1jKIpW9Ay9hJOdsQIVMVSaEq', 'siswa'),
('pustakawan1', '$2a$10$OSkNsvXLi4inMt4F5mPKp.4fkBkuM1jKIpW9Ay9hJOdsQIVMVSaEq', 'pustakawan');

-- Insert genres suitable for elementary school library
INSERT INTO genres (name) VALUES
('Fiksi Anak'),
('Dongeng'),
('Cerita Rakyat'),
('Sains'),
('Matematika'),
('Sejarah'),
('Kewarganegaraan'),
('Pendidikan Agama'),
('Bahasa Indonesia'),
('Bahasa Inggris'),
('Komik Edukasi'),
('Ensiklopedia Anak');

-- Insert sample books with cover images for elementary school
INSERT INTO books (title, author, genre_id, synopsis, cover_img) VALUES
('Petualangan si Kancil', 'Dian Kristiani', 3, 'Kumpulan cerita kancil yang mengajarkan nilai-nilai moral dan kecerdikan dalam menghadapi masalah.', 'kancil-adventures.jpg'),
('Belajar Berhitung Bersama Dodo', 'Watiek Ideo', 5, 'Buku matematika dasar yang mengajarkan konsep penjumlahan dan pengurangan dengan cara yang menyenangkan.', 'dodo-math.jpg'),
('Atlas Dunia untuk Anak', 'Tim Geografi', 12, 'Atlas bergambar yang memperkenalkan anak-anak pada geografi dunia dengan ilustrasi menarik.', 'kids-atlas.jpg'),
('Cerita Nabi untuk Anak', 'Ustadz Ahmad', 8, 'Kumpulan kisah-kisah nabi yang diceritakan dengan bahasa sederhana untuk anak-anak.', 'prophet-stories.jpg'),
('Seri Sains Dasar: Tubuh Kita', 'Dr. Sarah Johnson', 4, 'Pengenalan tentang anatomi tubuh manusia untuk anak-anak SD dengan ilustrasi yang informatif.', 'our-body.jpg'),
('Laskar Pelangi', 'Andrea Hirata', 1, 'Kisah inspiratif tentang perjuangan anak-anak di Belitung untuk mendapatkan pendidikan yang layak.', 'laskar-pelangi.jpg'),
('Kamus Bergambar 3 Bahasa', 'Tim Edukasi', 10, 'Kamus bergambar yang memuat kata-kata dasar dalam Bahasa Indonesia, Inggris, dan Arab.', 'picture-dictionary.jpg'),
('Pahlawan Nasional untuk Anak', 'Tim Sejarah', 6, 'Pengenalan tokoh-tokoh pahlawan nasional Indonesia untuk anak-anak sekolah dasar.', 'national-heroes.jpg');