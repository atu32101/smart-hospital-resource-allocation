# Smart Hospital Resource Allocation System
**College Minor Project (Java Spring Boot & Web Technologies)**

---

## 1. Project Title
**Smart Hospital Resource Allocation System (SHRAS)**

---

## 2. Problem Statement
In traditional hospital administration, bed allocation is often managed manually through paper registers or unstructured spreadsheets. During surges, emergencies, or peak admission hours, staff struggle to immediately identify available beds matching patient requirements (such as ICU, Private, or General wards). More critically, standard queuing often admits patients on a first-come-first-served basis rather than prioritizing life-threatening critical cases over mild ailments. This causes delays in emergency care, underutilization or misallocation of specialized beds, and administrative burnout.

---

## 3. Objectives
- **Automate Bed Management:** Track real-time status of all hospital beds across wards and floors.
- **Urgency-Based Triage:** Automatically prioritize waiting patients according to clinical severity (`CRITICAL > HIGH > MEDIUM > LOW`).
- **Intelligent Resource Matching:** Match patient medical needs to the appropriate bed type (`ICU`, `PRIVATE`, `GENERAL`) automatically.
- **Transparent Decision Audit:** Present clear reasons explaining why a specific bed was recommended.
- **Lifecycle Tracking:** Seamlessly update patient state (`WAITING` &rarr; `ADMITTED` &rarr; `DISCHARGED`), bed occupancy (`AVAILABLE` &rarr; `OCCUPIED` &rarr; `AVAILABLE`), and allocation history.
- **Clean College Minor Scope:** Maintain a concise, functional, and demonstrable system without enterprise overhead.

---

## 4. Why This Project is Useful
Healthcare facilities operate with finite, high-cost resources—especially Intensive Care Units (ICU) and private recovery rooms. The Smart Hospital Resource Allocation System provides immediate value:
1. **Prioritizes Patients by Medical Urgency:** Ensures critical patients with respiratory or cardiac distress receive ICU beds ahead of stable patients.
2. **Eliminates Manual Errors & Confusion:** Prevents double-booking and accidental allocation of occupied beds.
3. **Optimizes Ward Utilization:** Staff can view live bed availability across floors in seconds.
4. **Simplifies Discharge & Turnover:** A single click discharges a recovered patient and instantly returns the bed to the available pool for incoming patients.

---

## 5. Technology Stack

### Frontend
- **HTML5:** Semantic structure for portals and dashboards.
- **CSS3:** Custom hospital styling with responsive layouts.
- **JavaScript (ES6):** Dynamic DOM updates, interactive modals, and asynchronous communication via `fetch()`.
- **Bootstrap 5:** Responsive grid, cards, badges, navigation, and modal dialogs.
- **Chart.js:** Visual analytics for bed occupancy and urgency distributions.

### Backend
- **Java 21 / 17:** Core programming language.
- **Spring Boot 3:** Micro-framework for rapid setup and dependency injection.
- **Spring MVC:** RESTful API architecture.
- **Spring Data JPA & Hibernate:** ORM mapping, repositories, and transactional database persistence.
- **Maven:** Build, packaging, and dependency management tool.

### Database
- **H2 Database (In-Memory / Zero Config):** Configured as the ready-to-run default so the application starts instantly without requiring manual SQL service setup.
- **MySQL (Production / College Viva Ready):** Full MySQL schema (`schema-mysql.sql`) and dedicated configuration profile (`application-mysql.properties`) provided.

---

## 6. System Architecture

```text
[ Browser / Frontend ]
  │ HTML5, CSS3, JavaScript (Fetch API), Bootstrap 5, Chart.js
  ▼
[ REST API Layer ]
  │ AuthController, PatientController, BedController, AllocationController, DashboardController
  ▼
[ Service Layer (Business Logic) ]
  │ AuthService, PatientService, BedService, AllocationService, DashboardService
  ▼
[ Data Access Layer (Spring Data JPA / Hibernate) ]
  │ UserRepository, PatientRepository, BedRepository, AllocationRepository
  ▼
[ Database Layer ]
  │ MySQL / H2 Relational Database (Tables: users, patients, beds, allocations)
```

---

## 7. Database Tables

The system adheres strictly to four relational tables:

### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | Admin login username |
| `password` | VARCHAR(100) | NOT NULL | Admin password |
| `role` | VARCHAR(20) | NOT NULL | User authority (e.g. `ROLE_ADMIN`) |

### 2. `patients`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique patient ID |
| `name` | VARCHAR(100) | NOT NULL | Full patient name |
| `age` | INT | NOT NULL (0-120) | Patient age |
| `gender` | VARCHAR(10) | NOT NULL | Male / Female / Other |
| `phone` | VARCHAR(20) | NULLABLE | Contact telephone |
| `symptoms` | VARCHAR(255) | NULLABLE | Symptoms or medical complaint |
| `priority` | VARCHAR(20) | NOT NULL | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `required_bed_type` | VARCHAR(20) | NOT NULL | `GENERAL`, `PRIVATE`, `ICU` |
| `admission_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration / entry timestamp |
| `status` | VARCHAR(20) | NOT NULL | `WAITING`, `ADMITTED`, `DISCHARGED` |

### 3. `beds`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique bed ID |
| `bed_number` | VARCHAR(50) | NOT NULL, UNIQUE | Identifier (e.g. `B-101`, `ICU-301`) |
| `bed_type` | VARCHAR(20) | NOT NULL | `GENERAL`, `PRIVATE`, `ICU` |
| `floor` | INT | NOT NULL | Hospital floor number |
| `status` | VARCHAR(20) | NOT NULL | `AVAILABLE`, `OCCUPIED` |
| `patient_id` | BIGINT | FOREIGN KEY &rarr; `patients(id)` | Current occupant (NULL if available) |

### 4. `allocations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Allocation record identifier |
| `patient_id` | BIGINT | FOREIGN KEY &rarr; `patients(id)` | Allocated patient reference |
| `bed_id` | BIGINT | FOREIGN KEY &rarr; `beds(id)` | Allocated bed reference |
| `allocation_date`| TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp of admission |
| `priority` | VARCHAR(20) | NOT NULL | Patient priority tier at admission |
| `status` | VARCHAR(20) | NOT NULL | `ACTIVE` (admitted) or `COMPLETED` (discharged) |

---

## 8. ER Diagram Description
- **`patients` to `beds` (1:1 Active Relationship):** One admitted patient occupies at most one bed; each occupied bed points to one patient.
- **`patients` to `allocations` (1:N Relationship):** Over time, a patient can have allocation records documenting their admission history.
- **`beds` to `allocations` (1:N Relationship):** A bed can have multiple historical allocations across different patient hospitalizations.
- **`users`:** Manages administrator authentication credentials independently of medical records.

---

## 9. Smart Bed Allocation Algorithm

```text
START
  1. Retrieve waiting patient record (Status = 'WAITING').
  2. Determine Patient's Priority Weight:
       CRITICAL = 4
       HIGH     = 3
       MEDIUM   = 2
       LOW      = 1
  3. Identify Required Bed Type (ICU / PRIVATE / GENERAL).
  4. Query Bed repository for:
       bed_type = Required Bed Type AND status = 'AVAILABLE'.
  5. IF (Available Bed Found):
       - Select best available candidate bed.
       - Compile algorithmic recommendation with justification reasons:
           [✓] Matching bed type available.
           [✓] Satisfies patient priority urgency.
       - Return Recommendation to Admin.
     ELSE:
       - Return "No suitable bed is currently available."
       - Retain patient in WAITING queue.
  6. Admin reviews recommendation and clicks [Accept Allocation]:
       - Update Bed Status -> 'OCCUPIED' and assign patient_id.
       - Update Patient Status -> 'ADMITTED'.
       - Insert record into allocations table with status = 'ACTIVE'.
  7. When Patient recovers and is discharged:
       - Update Patient Status -> 'DISCHARGED'.
       - Update Bed Status -> 'AVAILABLE' and clear patient_id.
       - Update Allocation Status -> 'COMPLETED'.
END
```

---

## 10. Installation & Run Steps

### Prerequisites
- **Java Development Kit (JDK 17 or JDK 21)** installed.
- (Optional) **MySQL 8.0** if running against live MySQL.

### Quick Run (Zero Setup - Runs Immediately)
1. Open a terminal in the project directory:
   ```powershell
   cd "d:\Smart Hospital Resource Allocation"
   ```
2. Build and launch using the included Maven script:
   ```powershell
   .\mvnw.bat spring-boot:run
   ```
   *Or with standalone Maven:*
   ```bash
   mvn spring-boot:run
   ```
3. Open your web browser and navigate to:
   ```
   http://localhost:8080
   ```

---

## 11. MySQL Configuration (For MySQL College Viva / Submission)

If you wish to run the project connected directly to your local MySQL instance:

1. **Create the MySQL Database:**
   Log in to MySQL and execute `src/main/resources/schema-mysql.sql`, or run:
   ```sql
   CREATE DATABASE hospital_db;
   ```
2. **Configure Credentials:**
   Open `src/main/resources/application-mysql.properties` (or edit `application.properties`) and ensure your MySQL credentials match:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   ```
3. **Run with MySQL Profile:**
   ```powershell
   .\mvnw.bat spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

---

## 12. Sample Login Credentials

| Role | Username | Password |
|---|---|---|
| **Administrator** | `admin` | `admin123` |
| **Hospital Staff** | `staff` | `staff123` |

### Preloaded Demonstration Data
Upon startup, `DataInitializer` automatically inserts sample demonstration records:
- **2 Demo Accounts:** Admin (`admin` / `admin123`) & Staff (`staff` / `staff123`)
- **15 Beds:**
  - 5 General Beds (`B-101` to `B-105` on Floor 1)
  - 5 Private Beds (`P-201` to `P-205` on Floor 2)
  - 5 ICU Beds (`ICU-301` to `ICU-305` on Floor 3)
- **10 Triaged Patients:**
  - `Rahul Sharma` (Critical, requires ICU)
  - `Priya Patel` (Critical, requires ICU)
  - `Amit Kumar` (High, requires General)
  - `Sunita Devi` (High, requires Private)
  - `Vikram Singh` (High, requires General)
  - `Rajesh Gupta` (Medium, requires General)
  - `Ananya Roy` (Medium, requires Private)
  - `Neha Verma` (Low, requires General)
  - `Suresh Nair` (Low, requires Private)
  - `Pooja Mehta` (Low, requires General)

---

## 13. Demonstration Flow for Evaluation

```text
1. Login (admin / admin123)
      ↓
2. Dashboard (View patient & bed statistics and Chart.js graphs)
      ↓
3. Patient Management (Add a new patient or view existing priority list)
      ↓
4. Bed Management (View floor distribution & available bed counts)
      ↓
5. Smart Allocation (Select waiting patient, view recommendation & reasons)
      ↓
6. Accept Allocation (Patient becomes Admitted, Bed becomes Occupied)
      ↓
7. Allocation History (View active stay record)
      ↓
8. Discharge Patient (Bed becomes Available again for the next patient)
```

---

## 14. Future Scope
- **SMS/Email Notifications:** Alert patient family members upon bed allocation and room assignment.
- **Multi-Ward Specialty Types:** Expand bed categories to include Pediatric, Orthopedic, and Isolation/Burn units.
- **Predictive Length-of-Stay:** Estimate discharge dates based on diagnostic trends to forecast bed turnover.
- **Role-Based Access Control:** Separate portals for triage desk receptionists and ward head nurses.
