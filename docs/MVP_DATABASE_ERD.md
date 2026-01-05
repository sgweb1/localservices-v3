#  BAZA DANYCH - SZCZEGÓŁOWY ERD (Entity Relationship Diagram)

**Projekt:** Local Services MVP  
**Data:** 2025-01-05  
**Wersja:** 1.0

---

##  Diagram relacji (ASCII):

\\\
                  
   USERS        SERVICES    CATEGORIES  
                                                          
 id (PK)               id (PK)                id (PK)     
 name                  provider_id            name        
 email                 category_id            slug        
 role                  location_id           
          name         
                        price                 
                        duration      LOCATIONS   
                                             
                                                id (PK)     
                                                city        
                                 region      
                       SERVICE_IMAGES         
                                     
                        id (PK)      
                        service_id   
                        image_url    
                        position     
                       
       
                       
          BOOKINGS   
                                     
                        id (PK)      
                        service_id   
                        customer_id  
                        provider_id  
                        slot_id      
                        status       
                        start_time   
                        price        
                       
                              
                              
                       
                          RATINGS    
                                     
                        id (PK)      
                        booking_id   
                        provider_id  
                        customer_id  
                        rating (1-5) 
                        review_text  
                        reply_text   
                       
       
                       
       AVAILABILITY_SLOTS
                                         
                        id (PK)          
                        provider_id (FK) 
                        day_of_week      
                        start_time       
                        end_time         
                        price            
                        max_clients      
                        is_active        
                       
       
                       
       AVAILABILITY_EXCEPTIONS  
                                                
                        id (PK)                 
                        provider_id (FK)        
                        start_date              
                        end_date                
                        type (vacation/break)   
                        description             
                       
       
                       
         CONVERSATIONS   
                                         
                        id (PK)          
                        customer_id (FK) 
                        provider_id (FK) 
                        last_message_at  
                       
                                
                                
                       
                           MESSAGES      
                                         
                        id (PK)          
                        conversation_id  
                        sender_id (FK)   
                        receiver_id (FK) 
                        content          
                        is_read          
                        created_at       
                       
       
                       
         NOTIFICATIONS   
                                          
                         id (PK)          
                         user_id (FK)     
                         type             
                         title            
                         body             
                         data (JSON)      
                         is_read          
                         created_at       
                        
\\\

---

##  Szczegółowe definicje tabel:

### 1. **users** (Użytkownicy)
\\\sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) NULL,
    bio TEXT NULL,
    phone VARCHAR(50) NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    stripe_account_id VARCHAR(255) NULL,
    stripe_customer_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indeksy
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
\\\

**Relacje:**
- has many: services (jako provider)
- has many: bookings (jako customer i provider)
- has many: ratings (jako customer i provider)
- has many: availability_slots
- has many: availability_exceptions
- has many: messages
- has many: notifications

**Wartości ENUM dla role:**
- \customer\ - Klient
- \provider\ - Dostawca usług
- \dmin\ - Administrator

---

### 2. **categories** (Kategorie usług)
\\\sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    icon VARCHAR(100) NULL,
    parent_id BIGINT NULL REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
\\\

**Relacje:**
- has many: services
- belongs to: categories (self-reference, parent)

**Przykłady kategorii:**
- Sprzątanie, Ogrodnictwo, Hydraulika, Elektryk, Kosmetyka, Fryzjerstwo

---

### 3. **locations** (Lokalizacje)
\\\sql
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    region VARCHAR(255) NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Poland',
    postal_code VARCHAR(20) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_locations_city ON locations(city);
CREATE INDEX idx_locations_country ON locations(country);
CREATE INDEX idx_locations_coords ON locations(latitude, longitude);
\\\

**Relacje:**
- has many: services

---

### 4. **services** (Usługi)
\\\sql
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    location_id BIGINT NULL REFERENCES locations(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    short_description VARCHAR(500) NULL,
    price DECIMAL(10, 2) NOT NULL,
    price_min DECIMAL(10, 2) NULL,
    price_max DECIMAL(10, 2) NULL,
    duration INT NOT NULL DEFAULT 60,
    max_clients INT DEFAULT 1,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    thumbnail VARCHAR(500) NULL,
    views_count INT DEFAULT 0,
    bookings_count INT DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indeksy
CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_location ON services(location_id);
CREATE INDEX idx_services_published ON services(is_published);
CREATE INDEX idx_services_featured ON services(is_featured);
CREATE INDEX idx_services_rating ON services(avg_rating);
CREATE INDEX idx_services_slug ON services(slug);
\\\

**Relacje:**
- belongs to: users (provider)
- belongs to: categories
- belongs to: locations
- has many: service_images
- has many: bookings
- has many: ratings

---

### 5. **service_images** (Zdjęcia usług)
\\\sql
CREATE TABLE service_images (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NULL,
    position INT DEFAULT 0,
    alt_text VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_service_images_service ON service_images(service_id);
CREATE INDEX idx_service_images_position ON service_images(position);
\\\

**Relacje:**
- belongs to: services

---

### 6. **availability_slots** (Sloty dostępności - KALENDARZ )
\\\sql
CREATE TABLE availability_slots (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10, 2) NULL,
    max_clients INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    recurrence_rule VARCHAR(255) NULL,
    valid_from DATE NULL,
    valid_until DATE NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indeksy
CREATE INDEX idx_slots_provider ON availability_slots(provider_id);
CREATE INDEX idx_slots_day ON availability_slots(day_of_week);
CREATE INDEX idx_slots_active ON availability_slots(is_active);
CREATE INDEX idx_slots_dates ON availability_slots(valid_from, valid_until);
\\\

**Relacje:**
- belongs to: users (provider)
- has many: bookings

**Wartości day_of_week:**
- 0 = Niedziela
- 1 = Poniedziałek
- 2 = Wtorek
- 3 = Środa
- 4 = Czwartek
- 5 = Piątek
- 6 = Sobota

---

### 7. **availability_exceptions** (Wyjątki - urlopy, przerwy)
\\\sql
CREATE TABLE availability_exceptions (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'vacation',
    description TEXT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indeksy
CREATE INDEX idx_exceptions_provider ON availability_exceptions(provider_id);
CREATE INDEX idx_exceptions_dates ON availability_exceptions(start_date, end_date);
CREATE INDEX idx_exceptions_type ON availability_exceptions(type);
\\\

**Relacje:**
- belongs to: users (provider)

**Wartości ENUM dla type:**
- \acation\ - Urlop (cały dzień zablokowany)
- \reak\ - Przerwa (konkretne godziny)
- \holiday\ - Święto

---

### 8. **bookings** (Rezerwacje)
\\\sql
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id),
    customer_id BIGINT NOT NULL REFERENCES users(id),
    provider_id BIGINT NOT NULL REFERENCES users(id),
    slot_id BIGINT NULL REFERENCES availability_slots(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    price DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    payment_intent_id VARCHAR(255) NULL,
    notes TEXT NULL,
    customer_notes TEXT NULL,
    cancellation_reason TEXT NULL,
    cancelled_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indeksy
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_payment ON bookings(payment_status);
\\\

**Relacje:**
- belongs to: services
- belongs to: users (customer)
- belongs to: users (provider)
- belongs to: availability_slots
- has one: rating

**Wartości ENUM dla status:**
- \pending\ - Oczekuje na potwierdzenie
- \confirmed\ - Potwierdzona przez providera
- \completed\ - Zrealizowana
- \cancelled\ - Anulowana
- \ejected\ - Odrzucona przez providera

**Wartości ENUM dla payment_status:**
- \unpaid\ - Nieopłacona
- \paid\ - Opłacona
- \efunded\ - Zwrot pieniędzy

---

### 9. **ratings** (Oceny i recenzje)
\\\sql
CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id),
    provider_id BIGINT NOT NULL REFERENCES users(id),
    customer_id BIGINT NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NULL,
    reply_text TEXT NULL,
    replied_at TIMESTAMP NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indeksy
CREATE INDEX idx_ratings_booking ON ratings(booking_id);
CREATE INDEX idx_ratings_service ON ratings(service_id);
CREATE INDEX idx_ratings_provider ON ratings(provider_id);
CREATE INDEX idx_ratings_customer ON ratings(customer_id);
CREATE INDEX idx_ratings_rating ON ratings(rating);
CREATE INDEX idx_ratings_visible ON ratings(is_visible);
\\\

**Relacje:**
- belongs to: bookings
- belongs to: services
- belongs to: users (provider)
- belongs to: users (customer)

---

### 10. **conversations** (Konwersacje)
\\\sql
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id BIGINT NULL REFERENCES services(id),
    last_message_at TIMESTAMP NULL,
    last_message_preview TEXT NULL,
    unread_count_customer INT DEFAULT 0,
    unread_count_provider INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indeksy
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_provider ON conversations(provider_id);
CREATE INDEX idx_conversations_service ON conversations(service_id);
CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at);
CREATE UNIQUE INDEX idx_conversations_unique ON conversations(customer_id, provider_id, service_id);
\\\

**Relacje:**
- belongs to: users (customer)
- belongs to: users (provider)
- belongs to: services (optional)
- has many: messages

---

### 11. **messages** (Wiadomości)
\\\sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    receiver_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_system BOOLEAN DEFAULT FALSE,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indeksy
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_read ON messages(is_read);
CREATE INDEX idx_messages_created ON messages(created_at);
\\\

**Relacje:**
- belongs to: conversations
- belongs to: users (sender)
- belongs to: users (receiver)

---

### 12. **notifications** (Powiadomienia)
\\\sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    action_url VARCHAR(500) NULL,
    icon VARCHAR(100) NULL,
    priority VARCHAR(50) DEFAULT 'normal',
    sent_via JSON NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_priority ON notifications(priority);
\\\

**Relacje:**
- belongs to: users

**Wartości ENUM dla type:**
- \ooking_new\ - Nowa rezerwacja
- \ooking_confirmed\ - Rezerwacja potwierdzona
- \ooking_cancelled\ - Rezerwacja anulowana
- \message_received\ - Nowa wiadomość
- \eview_new\ - Nowa recenzja
- \eview_reply\ - Odpowiedź na recenzję

**Wartości ENUM dla priority:**
- \low\ - Niski
- \
ormal\ - Normalny
- \high\ - Wysoki
- \urgent\ - Pilny

---

##  Podsumowanie relacji:

| Tabela | Klucze obce (FK) | Relacje |
|--------|------------------|---------|
| **users** | - | has many: services, bookings (2x), ratings (2x), slots, exceptions, conversations (2x), messages (2x), notifications |
| **categories** | parent_id  categories | has many: services; belongs to: categories (parent) |
| **locations** | - | has many: services |
| **services** | provider_id  users, category_id  categories, location_id  locations | has many: images, bookings, ratings; belongs to: users, categories, locations |
| **service_images** | service_id  services | belongs to: services |
| **availability_slots** | provider_id  users | belongs to: users; has many: bookings |
| **availability_exceptions** | provider_id  users | belongs to: users |
| **bookings** | service_id  services, customer_id  users, provider_id  users, slot_id  availability_slots | belongs to: services, users (2x), slots; has one: rating |
| **ratings** | booking_id  bookings, service_id  services, provider_id  users, customer_id  users | belongs to: bookings, services, users (2x) |
| **conversations** | customer_id  users, provider_id  users, service_id  services | belongs to: users (2x), services; has many: messages |
| **messages** | conversation_id  conversations, sender_id  users, receiver_id  users | belongs to: conversations, users (2x) |
| **notifications** | user_id  users | belongs to: users |

---

##  Statystyki bazy danych MVP:

| Metryka | Wartość |
|---------|---------|
| **Tabele główne** | 12 |
| **Foreign Keys** | 32 |
| **Indeksy** | 65+ |
| **JSON fields** | 3 (data, metadata, sent_via) |
| **Soft deletes** | 7 tabel (deleted_at) |
| **Timestamps** | Wszystkie tabele (created_at, updated_at) |
| **Unique constraints** | 8 |
| **Check constraints** | 1 (rating 1-5) |

---

##  Kluczowe constrainty i walidacje:

1. **users.email** - UNIQUE (nie można dwóch kont z tym samym emailem)
2. **categories.slug** - UNIQUE (SEO-friendly URLs)
3. **services.slug** - UNIQUE (SEO-friendly URLs)
4. **ratings.rating** - CHECK (rating >= 1 AND rating <= 5)
5. **ratings.booking_id** - UNIQUE (jedna ocena na rezerwację)
6. **conversations** - UNIQUE(customer_id, provider_id, service_id)

---

##  Przykładowe zapytania SQL:

### Pobierz wszystkie usługi z kategorią i lokalizacją:
\\\sql
SELECT s.*, c.name AS category_name, l.city AS location_city
FROM services s
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN locations l ON s.location_id = l.id
WHERE s.is_published = TRUE
ORDER BY s.avg_rating DESC, s.bookings_count DESC;
\\\

### Pobierz sloty kalendarza na dany tydzień:
\\\sql
SELECT * FROM availability_slots
WHERE provider_id = 123
  AND is_active = TRUE
  AND (valid_from IS NULL OR valid_from <= '2025-01-10')
  AND (valid_until IS NULL OR valid_until >= '2025-01-06')
ORDER BY day_of_week, start_time;
\\\

### Pobierz rezerwacje z konfliktem:
\\\sql
SELECT b1.*, b2.id AS conflicting_booking_id
FROM bookings b1
JOIN bookings b2 ON b1.provider_id = b2.provider_id
  AND b1.id != b2.id
  AND b1.booking_date = b2.booking_date
  AND b1.start_time < b2.end_time
  AND b1.end_time > b2.start_time
WHERE b1.status NOT IN ('cancelled', 'rejected')
  AND b2.status NOT IN ('cancelled', 'rejected');
\\\

### Pobierz średnią ocenę providera:
\\\sql
SELECT provider_id, AVG(rating) AS avg_rating, COUNT(*) AS total_ratings
FROM ratings
WHERE is_visible = TRUE
GROUP BY provider_id;
\\\

---

**Plik utworzony:**  2025-01-05
