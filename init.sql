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
INSERT INTO users (username, password, role) VALUES
('siswa1', '$2a$10$OSkNsvXLi4inMt4F5mPKp.4fkBkuM1jKIpW9Ay9hJOdsQIVMVSaEq', 'siswa'),
('pustakawan1', '$2a$10$OSkNsvXLi4inMt4F5mPKp.4fkBkuM1jKIpW9Ay9hJOdsQIVMVSaEq', 'pustakawan');

-- Insert genres
INSERT INTO genres (name) VALUES
('Matematika'),
('IPA'),
('IPS'),
('Bahasa Indonesia'),
('Bahasa Inggris'),
('PPKn'),
('Pendidikan Agama'),
('Seni Budaya'),
('Dongeng'),
('Cerita Rakyat'),
('Ensiklopedia'),
('Komik Edukasi');

-- Insert comprehensive book collection for SD (50+ books)
INSERT INTO books (title, author, genre_id, synopsis, cover_img) VALUES
-- MATEMATIKA (Kelas 1-6)
('Matematika untuk SD/MI Kelas 1', 'Kemdikbud', 1, 'Buku pelajaran matematika untuk siswa kelas 1 SD yang mencakup pengenalan angka 1-100, penjumlahan dan pengurangan sederhana, pengenalan bentuk geometri dasar seperti lingkaran, segitiga, dan persegi. Dilengkapi dengan latihan soal berwarna dan ilustrasi menarik untuk memudahkan pemahaman konsep matematika dasar.', NULL),
('Matematika untuk SD/MI Kelas 2', 'Kemdikbud', 1, 'Buku matematika kelas 2 yang mengajarkan operasi penjumlahan dan pengurangan hingga 500, pengenalan perkalian sederhana, pengukuran panjang dengan satuan baku, dan pengenalan pecahan sederhana. Setiap bab dilengkapi dengan contoh soal dan latihan untuk memperkuat pemahaman.', NULL),
('Matematika untuk SD/MI Kelas 3', 'Kemdikbud', 1, 'Materi matematika kelas 3 mencakup operasi hitung campuran, perkalian dan pembagian, pecahan sederhana, pengukuran waktu, panjang, dan berat. Buku ini dirancang dengan pendekatan kontekstual yang menghubungkan matematika dengan kehidupan sehari-hari siswa.', NULL),
('Matematika untuk SD/MI Kelas 4', 'Kemdikbud', 1, 'Buku ini membahas bilangan bulat, KPK dan FPB, pengukuran sudut, keliling dan luas bangun datar, serta pengenalan koordinat. Dilengkapi dengan soal cerita yang melatih kemampuan berpikir logis dan problem solving siswa dalam konteks nyata.', NULL),
('Matematika untuk SD/MI Kelas 5', 'Kemdikbud', 1, 'Materi mencakup operasi hitung bilangan bulat dan pecahan, pangkat dan akar, skala dan perbandingan, volume bangun ruang, dan pengolahan data sederhana. Buku ini menekankan pada pemahaman konsep dan aplikasi matematika dalam kehidupan sehari-hari.', NULL),
('Matematika untuk SD/MI Kelas 6', 'Kemdikbud', 1, 'Buku matematika kelas 6 membahas bilangan bulat negatif, operasi hitung campuran pecahan, sistem koordinat, luas dan volume bangun ruang, statistika dasar, dan peluang sederhana. Sebagai persiapan untuk jenjang SMP dengan soal-soal yang lebih kompleks.', NULL),

-- IPA (Kelas 1-6)
('IPA untuk SD/MI Kelas 1', 'Kemdikbud', 2, 'Pengenalan sains untuk kelas 1 yang mengajarkan tentang tubuh manusia dan panca indera, makhluk hidup di sekitar kita, benda dan sifatnya, serta perubahan wujud benda sederhana. Disajikan dengan gambar ilustrasi berwarna yang menarik dan mudah dipahami anak.', NULL),
('IPA untuk SD/MI Kelas 2', 'Kemdikbud', 2, 'Buku IPA kelas 2 membahas pertumbuhan hewan dan tumbuhan, bagian-bagian tumbuhan, gerak benda, sumber energi, dan perubahan kenampakan bumi. Dilengkapi dengan kegiatan pengamatan sederhana yang dapat dilakukan siswa.', NULL),
('IPA untuk SD/MI Kelas 3', 'Kemdikbud', 2, 'Materi mencakup ciri-ciri makhluk hidup, penggolongan makhluk hidup, perubahan sifat benda, gaya dan gerak, energi alternatif, dan cuaca. Setiap bab dilengkapi dengan eksperimen sederhana untuk melatih keterampilan proses sains siswa.', NULL),
('IPA untuk SD/MI Kelas 4', 'Kemdikbud', 2, 'Membahas rangka dan organ tubuh manusia, daur hidup hewan, sifat-sifat cahaya, gaya, energi bunyi, dan perubahan lingkungan. Buku ini mengajak siswa untuk berpikir kritis melalui pertanyaan-pertanyaan yang menantang di setiap akhir bab.', NULL),
('IPA untuk SD/MI Kelas 5', 'Kemdikbud', 2, 'Buku ini mengajarkan tentang organ tubuh manusia dan fungsinya, adaptasi makhluk hidup, sistem pencernaan, pernapasan, peredaran darah, pesawat sederhana, dan sifat-sifat cahaya. Dilengkapi dengan diagram dan ilustrasi yang detail.', NULL),
('IPA untuk SD/MI Kelas 6', 'Kemdikbud', 2, 'Materi kelas 6 mencakup ciri khusus makhluk hidup, perkembangbiakan makhluk hidup, keseimbangan ekosistem, sistem tata surya, konduktor dan isolator, serta transformasi energi. Sebagai persiapan materi IPA tingkat lanjut.', NULL),

-- IPS (Kelas 1-6)
('IPS untuk SD/MI Kelas 1', 'Kemdikbud', 3, 'Pengenalan konsep sosial dasar seperti identitas diri, keluarga, lingkungan rumah, dan tetangga. Buku ini mengajarkan nilai-nilai hidup rukun, gotong royong, dan menghargai perbedaan sejak dini dengan bahasa yang sederhana.', NULL),
('IPS untuk SD/MI Kelas 2', 'Kemdikbud', 3, 'Membahas kehidupan bertetangga, peristiwa penting dalam keluarga, dokumen dan koleksi benda berharga keluarga, serta pengenalan lingkungan sekolah. Mengajarkan siswa untuk peduli terhadap lingkungan sosial mereka.', NULL),
('IPS untuk SD/MI Kelas 3', 'Kemdikbud', 3, 'Materi mencakup lingkungan alam dan buatan, denah dan peta sederhana, kegiatan ekonomi, dan koperasi. Buku ini memperkenalkan konsep dasar geografi dan ekonomi dengan contoh-contoh yang dekat dengan kehidupan siswa.', NULL),
('IPS untuk SD/MI Kelas 4', 'Kemdikbud', 3, 'Membahas sejarah dan keragaman suku bangsa Indonesia, kegiatan ekonomi, koperasi, teknologi produksi, komunikasi, dan transportasi. Mengajarkan siswa untuk bangga akan keberagaman budaya Indonesia.', NULL),
('IPS untuk SD/MI Kelas 5', 'Kemdikbud', 3, 'Buku ini mengajarkan tentang perjuangan para pahlawan, proklamasi kemerdekaan, persiapan kemerdekaan Indonesia, kenampakan alam dan buatan, keragaman suku bangsa dan budaya. Menumbuhkan rasa nasionalisme dan cinta tanah air.', NULL),
('IPS untuk SD/MI Kelas 6', 'Kemdikbud', 3, 'Materi mencakup perkembangan sistem administrasi wilayah Indonesia, kenampakan alam dan buatan, keragaman kenampakan alam di Indonesia, gejala alam di Indonesia dan negara tetangga, serta peran Indonesia di Asia Tenggara.', NULL),

-- BAHASA INDONESIA (Kelas 1-6)
('Bahasa Indonesia untuk SD/MI Kelas 1', 'Kemdikbud', 4, 'Buku pembelajaran membaca dan menulis permulaan dengan metode yang menyenangkan. Mencakup pengenalan huruf, suku kata, kata, dan kalimat sederhana. Dilengkapi dengan cerita bergambar dan latihan menulis yang menarik untuk membangun fondasi literasi yang kuat.', NULL),
('Bahasa Indonesia untuk SD/MI Kelas 2', 'Kemdikbud', 4, 'Mengajarkan keterampilan membaca pemahaman, menulis kalimat dan paragraf sederhana, berbicara dan menyimak. Setiap bab menyajikan teks bacaan yang sesuai dengan tingkat perkembangan kognitif siswa kelas 2.', NULL),
('Bahasa Indonesia untuk SD/MI Kelas 3', 'Kemdikbud', 4, 'Buku ini mengembangkan kemampuan membaca intensif dan ekstensif, menulis karangan sederhana, berpidato, dan drama pendek. Dilengkapi dengan kosakata baru dan latihan tata bahasa yang sesuai dengan kurikulum.', NULL),
('Bahasa Indonesia untuk SD/MI Kelas 4', 'Kemdikbud', 4, 'Materi mencakup membaca teks informatif, menulis laporan, surat, dan karangan deskripsi. Mengajarkan penggunaan kalimat efektif dan pemahaman berbagai jenis teks dengan contoh-contoh yang relevan.', NULL),
('Bahasa Indonesia untuk SD/MI Kelas 5', 'Kemdikbud', 4, 'Membahas membaca berbagai jenis teks, menulis karangan narasi dan eksposisi, pidato, drama, dan puisi. Mengembangkan kemampuan berpikir kritis melalui analisis teks dan latihan menulis kreatif.', NULL),
('Bahasa Indonesia untuk SD/MI Kelas 6', 'Kemdikbud', 4, 'Buku ini mempersiapkan siswa dengan kemampuan membaca kritis, menulis karya ilmiah sederhana, laporan, dan karangan argumentasi. Mencakup materi tata bahasa yang lebih kompleks dan latihan soal ujian.', NULL),

-- BAHASA INGGRIS
('Bahasa Inggris untuk SD/MI Kelas 1', 'Tim Erlangga', 5, 'Introduction to English for young learners dengan fokus pada vocabulary dasar seperti colors, numbers, animals, fruits, dan body parts. Menggunakan lagu, permainan, dan aktivitas menyenangkan untuk memperkenalkan bahasa Inggris.', NULL),
('Bahasa Inggris untuk SD/MI Kelas 2', 'Tim Erlangga', 5, 'English learning book yang mengajarkan simple greetings, classroom language, family members, daily activities dengan metode communicative approach. Dilengkapi dengan audio dan gambar ilustrasi yang menarik.', NULL),
('Bahasa Inggris untuk SD/MI Kelas 3', 'Tim Erlangga', 5, 'Membahas simple present tense, prepositions, adjectives, dan vocabulary tentang school, home, dan hobbies. Setiap unit dilengkapi dengan conversation practice dan fun activities.', NULL),
('Bahasa Inggris untuk SD/MI Kelas 4', 'Tim Erlangga', 5, 'Buku ini mengajarkan present continuous tense, simple past tense, modal verbs, dan reading comprehension. Materi disajikan dengan konteks yang relevan dengan kehidupan siswa SD.', NULL),
('Bahasa Inggris untuk SD/MI Kelas 5', 'Tim Erlangga', 5, 'Mencakup materi tenses yang lebih kompleks, comparative and superlative, conjunctions, dan berbagai jenis teks seperti narrative, descriptive, dan procedure. Dilengkapi dengan speaking dan writing practice.', NULL),
('Bahasa Inggris untuk SD/MI Kelas 6', 'Tim Erlangga', 5, 'Persiapan untuk jenjang SMP dengan materi grammar lengkap, reading comprehension tingkat lanjut, writing skills, dan conversation practice. Termasuk latihan soal ujian dan vocabulary list yang komprehensif.', NULL),

-- PPKn (Kelas 1-6)
('PPKn untuk SD/MI Kelas 1', 'Kemdikbud', 6, 'Pengenalan nilai-nilai Pancasila dalam kehidupan sehari-hari, tata tertib di rumah dan sekolah, hak dan kewajiban sebagai anak. Mengajarkan karakter baik seperti jujur, disiplin, dan tanggung jawab sejak dini.', NULL),
('PPKn untuk SD/MI Kelas 2', 'Kemdikbud', 6, 'Membahas sikap hidup rukun di rumah dan sekolah, musyawarah, gotong royong, dan pengenalan simbol-simbol negara. Menumbuhkan rasa cinta tanah air dan persatuan melalui nilai-nilai Pancasila.', NULL),
('PPKn untuk SD/MI Kelas 3', 'Kemdikbud', 6, 'Buku ini mengajarkan tentang norma-norma yang berlaku di masyarakat, harga diri, kebanggaan, dan percaya diri. Dilengkapi dengan studi kasus dan diskusi untuk mengembangkan moral siswa.', NULL),
('PPKn untuk SD/MI Kelas 4', 'Kemdikbud', 6, 'Materi mencakup sistem pemerintahan desa dan kecamatan, globalisasi, cinta tanah air, keberagaman suku dan agama. Mengajarkan siswa untuk menghargai perbedaan dan hidup berdampingan secara damai.', NULL),
('PPKn untuk SD/MI Kelas 5', 'Kemdikbud', 6, 'Membahas nilai-nilai Pancasila, kebebasan berorganisasi, keputusan bersama, dan keberagaman di Indonesia. Menumbuhkan sikap demokratis dan menghargai HAM sejak usia dini.', NULL),
('PPKn untuk SD/MI Kelas 6', 'Kemdikbud', 6, 'Buku ini mengajarkan tentang nilai-nilai Pancasila dalam kehidupan berbangsa dan bernegara, politik luar negeri Indonesia, dan peran Indonesia di dunia internasional. Mempersiapkan siswa menjadi warga negara yang baik.', NULL),

-- PENDIDIKAN AGAMA ISLAM
('Pendidikan Agama Islam Kelas 1', 'Kemdikbud', 7, 'Pengenalan dasar-dasar agama Islam seperti rukun iman, rukun Islam, hafalan surat-surat pendek Al-Quran (An-Nas, Al-Falaq, Al-Ikhlas), doa sehari-hari, dan kisah-kisah Nabi yang inspiratif untuk anak-anak.', NULL),
('Pendidikan Agama Islam Kelas 2', 'Kemdikbud', 7, 'Buku ini mengajarkan tentang bersuci, shalat, dan bacaan Al-Quran. Mencakup praktik ibadah sehari-hari dengan panduan yang mudah dipahami anak-anak, disertai ilustrasi gerakan shalat yang lengkap.', NULL),
('Pendidikan Agama Islam Kelas 3', 'Kemdikbud', 7, 'Membahas akhlak terpuji, kisah-kisah teladan dari para Nabi, adab dalam berbagai situasi, dan pengenalan sejarah Islam. Mengajarkan nilai-nilai moral Islam dalam kehidupan sehari-hari.', NULL),
('Pendidikan Agama Islam Kelas 4', 'Kemdikbud', 7, 'Materi mencakup kisah Nabi Muhammad SAW, asmaul husna, tajwid dasar, dan praktik ibadah. Dilengkapi dengan kisah sahabat Nabi yang menjadi teladan akhlak mulia untuk anak-anak.', NULL),
('Pendidikan Agama Islam Kelas 5', 'Kemdikbud', 7, 'Buku ini mengajarkan tentang sejarah Islam, zakat, puasa, dan haji. Materi disajikan dengan bahasa yang mudah dipahami dan dilengkapi dengan hikmah dari setiap ibadah yang diajarkan.', NULL),
('Pendidikan Agama Islam Kelas 6', 'Kemdikbud', 7, 'Membahas qada dan qadar, rasul dan kitab suci, kisah para sahabat Nabi, dan perkembangan Islam di Indonesia. Mempersiapkan pemahaman agama yang lebih mendalam untuk jenjang berikutnya.', NULL),

-- SENI BUDAYA DAN PRAKARYA
('Seni Budaya dan Prakarya Kelas 1', 'Kemdikbud', 8, 'Pengenalan seni rupa, musik, tari, dan prakarya untuk anak kelas 1. Mengajarkan menggambar, mewarnai, menyanyi lagu anak-anak, gerak dan tari sederhana, serta membuat kerajinan tangan dari bahan bekas.', NULL),
('Seni Budaya dan Prakarya Kelas 2', 'Kemdikbud', 8, 'Buku ini mengembangkan kreativitas melalui seni lukis, kolase, origami, lagu daerah, dan tarian tradisional sederhana. Setiap aktivitas dirancang untuk mengasah motorik halus dan kreativitas anak.', NULL),
('Seni Budaya dan Prakarya Kelas 3', 'Kemdikbud', 8, 'Materi mencakup teknik menggambar dan melukis, alat musik tradisional, tari kreasi, dan membuat berbagai kerajinan. Mengenalkan kekayaan budaya Indonesia melalui seni.', NULL),
('Seni Budaya dan Prakarya Kelas 4', 'Kemdikbud', 8, 'Membahas apresiasi seni rupa, musik ansambel, tari daerah, dan prakarya dari berbagai bahan. Mengajarkan siswa untuk menghargai dan melestarikan budaya Indonesia.', NULL),
('Seni Budaya dan Prakarya Kelas 5', 'Kemdikbud', 8, 'Buku ini mengajarkan teknik menggambar perspektif, bermain alat musik melodis, koreografi tari sederhana, dan membuat produk kerajinan yang memiliki nilai ekonomi.', NULL),
('Seni Budaya dan Prakarya Kelas 6', 'Kemdikbud', 8, 'Materi lanjutan tentang seni rupa, musik tradisional dan modern, tari kreasi baru, dan kewirausahaan sederhana melalui prakarya. Mempersiapkan siswa untuk mengembangkan bakat seni mereka.', NULL),

-- BUKU PENUNJANG DAN BACAAN
('Kamus Bahasa Indonesia untuk Anak', 'Tim Balai Pustaka', 4, 'Kamus komprehensif yang berisi lebih dari 10.000 kosakata Bahasa Indonesia dengan penjelasan yang mudah dipahami anak-anak. Dilengkapi dengan contoh kalimat, ilustrasi menarik, dan panduan penggunaan kata yang tepat.', NULL),
('Kamus Bergambar Inggris-Indonesia', 'Tim Erlangga', 5, 'Kamus visual dengan lebih dari 2000 kata dalam bahasa Inggris dan Indonesia. Setiap kata disertai dengan gambar berwarna yang memudahkan anak memahami dan mengingat vocabulary. Dilengkapi dengan topik-topik seperti family, food, animals, dan transportation.', NULL),
('Atlas Indonesia dan Dunia', 'Tim Geografi', 11, 'Atlas lengkap yang menampilkan peta Indonesia dan dunia dengan detail. Mencakup informasi geografis, demografi, budaya, dan ekonomi setiap wilayah. Dilengkapi dengan fakta menarik tentang setiap negara dan benua.', NULL),
('Ensiklopedia Anak: Alam Semesta', 'Tim Sains', 11, 'Ensiklopedia yang membahas tentang tata surya, planet, bintang, galaksi, dan fenomena alam semesta lainnya. Disajikan dengan ilustrasi spektakuler dan penjelasan yang mudah dipahami anak-anak SD.', NULL),
('Ensiklopedia Hewan untuk Anak', 'Dr. Fauna', 11, 'Koleksi lengkap informasi tentang lebih dari 200 spesies hewan dari seluruh dunia. Mencakup habitat, makanan, perilaku, dan fakta unik setiap hewan. Dilengkapi dengan foto-foto berkualitas tinggi dan diagram anatomi.', NULL),
('Kumpulan Dongeng Nusantara', 'Tim Sastra', 10, 'Koleksi 30 dongeng dari berbagai daerah di Indonesia seperti Malin Kundang, Bawang Merah Bawang Putih, Timun Mas, Keong Mas, dan lainnya. Setiap dongeng mengandung nilai moral dan kearifan lokal yang diceritakan dengan bahasa yang menarik.', NULL),
('Cerita Rakyat dari 34 Provinsi', 'Dian Sastro', 10, 'Kumpulan cerita rakyat legendaris dari setiap provinsi di Indonesia. Menceritakan asal-usul nama tempat, tokoh legendaris, dan kearifan lokal. Dilengkapi dengan ilustrasi budaya dan peta lokasi cerita.', NULL),
('Dongeng Dunia Pilihan', 'Hans Christian', 9, 'Koleksi dongeng klasik dunia seperti Cinderella, Snow White, The Little Mermaid, Pinocchio, dan lainnya. Diterjemahkan dengan bahasa yang mudah dipahami anak-anak Indonesia dan dilengkapi ilustrasi yang indah.', NULL),
('Fabel Binatang Nusantara', 'Kak Ros', 9, 'Kumpulan cerita fabel dengan tokoh binatang yang mengajarkan nilai moral seperti kejujuran, kerja keras, dan persahabatan. Termasuk cerita Si Kancil, Kura-kura dan Kelinci, dan cerita binatang lainnya.', NULL),
('Kisah 25 Nabi dan Rasul', 'Ustadz Yusuf', 7, 'Buku yang menceritakan kisah lengkap 25 Nabi dan Rasul dari Nabi Adam hingga Nabi Muhammad SAW. Setiap kisah diceritakan dengan bahasa yang mudah dipahami anak dan mengandung hikmah yang mendalam.', NULL),
('Cerita Sahabat Nabi', 'Ustadzah Aisyah', 7, 'Kumpulan kisah inspiratif dari para sahabat Nabi Muhammad SAW seperti Abu Bakar, Umar, Utsman, Ali, dan sahabat lainnya. Mengajarkan keteguhan iman, keberanian, dan pengorbanan untuk Islam.', NULL),
('Pahlawan Indonesia untuk Anak', 'Tim Sejarah', 6, 'Biografi singkat 45 pahlawan nasional Indonesia mulai dari Pangeran Diponegoro, Cut Nyak Dien, R.A. Kartini, Soekarno, hingga Mohammad Hatta. Diceritakan dengan gaya bertutur yang menarik untuk anak-anak.', NULL),
('Kisah Inspiratif Tokoh Dunia', 'Tim Motivasi', 11, 'Kumpulan biografi tokoh-tokoh inspiratif dunia seperti Albert Einstein, Thomas Alva Edison, Marie Curie, dan lainnya. Mengajarkan nilai kerja keras, pantang menyerah, dan inovasi kepada anak-anak.', NULL),
('Belajar Sains dari Alam', 'Prof. Budi', 2, 'Buku eksperimen sains sederhana yang bisa dilakukan di rumah dengan bahan-bahan yang mudah didapat. Mengajarkan konsep fisika, kimia, dan biologi melalui percobaan yang menyenangkan dan aman.', NULL),
('Matematika Asyik dengan Permainan', 'Siti Nurjanah', 1, 'Buku yang mengajarkan matematika melalui permainan, teka-teki, dan puzzle. Mencakup operasi hitung, logika, dan problem solving dengan cara yang menyenangkan sehingga anak tidak merasa belajar.', NULL);