# TaskTrack Backend

Website deadline tugas — Backend API menggunakan Flask + TursoDB.

## Cara Setup (Untuk Developer Baru)

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/TaskTrack.git
cd TaskTrack
```

### 2. Buat Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4. Setup Environment Variables
```bash
# Kembali ke root folder
cd ..
cp .env.example .env
# Edit file .env dan isi dengan credentials yang benar
# Minta DATABASE_URL ke teman yang handle backend
```

### 5. Jalankan Server
```bash
cd backend
python app.py
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /register | Register user baru |
| POST | /login | Login user |
| POST | /logout | Logout user |
| GET | /dashboard | Data dashboard user |
| POST | /tasks | Tambah tugas |
| GET | /tasks | Lihat semua tugas |
| PUT | /tasks/:id | Edit tugas |
| DELETE | /tasks/:id | Hapus tugas |
| PATCH | /tasks/:id/complete | Tandai selesai |
| GET | /tasks/search?q= | Cari tugas |
| GET | /tasks/filter?subject= | Filter mapel |
