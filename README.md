# 🚀 DaysOff - Application de Gestion des Congés et Présences

![Angular](https://img.shields.io/badge/Angular-19+-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4+-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Une solution Full-Stack robuste et moderne développée avec **Spring Boot** et **Angular 19** pour automatiser la gestion des ressources humaines, spécifiquement les congés et le suivi des présences en temps réel.

---

## 📋 Table des Matières
- [ℹ️ À Propos](#️-à-propos)
- [✨ Fonctionnalités Clés](#-fonctionnalités-clés)
- [🛠 Technologies & Outils](#-technologies--outils)
- [🏗 Architecture](#-architecture)
- [🚀 Installation & Démarrage](#-installation--démarrage)
- [⚙️ CI/CD & Qualité](#️-cicd--qualité)
- [✅ Compétences Validées](#-compétences-validées)

---

## ℹ️ À Propos

**DaysOff** est conçu pour simplifier les processus RH au sein d'une entreprise. L'application permet aux employés de soumettre des demandes de congés, de pointer leurs présences et de communiquer en temps réel avec l'administration.

**Objectif :** Digitaliser la gestion administrative des employés avec une interface réactive et une sécurité de niveau entreprise (JWT).

---

## ✨ Fonctionnalités Clés

### 📅 Gestion des Congés (Leave Management)
*   Soumission de demandes de congés avec types (Annuel, Maladie, etc.).
*   Validation/Refus par les RH ou SuperAdmin.
*   Calcul automatique du solde de congés restants.

### 🕒 Suivi des Présences (Attendance)
*   Pointage (Check-in/Check-out) quotidien.
*   Suivi des heures de travail et des retards.
*   Génération de rapports de présence pour l'administration.

### 💬 Communication & Notifications
*   Notifications en temps réel via **WebSockets (STOMP)**.
*   Système de chat interne pour les échanges rapides sur les dossiers.
*   Tableau de bord interactif avec indicateurs clés (KPIs).

### 🔐 Sécurité & Rôles
*   Authentification basée sur **JWT (JSON Web Tokens)**.
*   Gestion granulaire des accès : **SuperAdmin**, **HR**, **Employee**.
*   Protection des routes et des points de terminaison API avec **Spring Security**.

---

## 🛠 Technologies & Outils

| Catégorie | Technologie | Utilisation |
| :--- | :--- | :--- |
| **Backend** | **Spring Boot 3.4+** | API REST, Sécurité, Logique métier. |
| **Frontend** | **Angular 19** | Interface utilisateur moderne et SPA. |
| **Base de Données** | **PostgreSQL / MySQL** | Persistance des données (JPA/Hibernate). |
| **Styling** | **Tailwind CSS 4** | Design system utilitaire et ultra-performant. |
| **Temps Réel** | **WebSocket (STOMP)** | Notifications et mises à jour instantanées. |
| **DevOps** | **Docker & Docker Compose** | Containerisation et orchestration. |
| **CI/CD** | **Jenkins** | Automatisation des builds, tests et déploiements. |

---

## 🏗 Architecture

L'application suit une séparation claire des préoccupations :

### Backend (Java)
```
src/main/java/io/github/youco/dayoff/
├── controller/         # Points d'entrée API REST
├── service/            # Logique métier et Interfaces
├── repository/         # Accès aux données (Spring Data JPA)
├── model/              # Entités et DTOs
├── security/           # Configuration JWT et Sécurité
└── config/             # Configuration WebSocket, Swagger, AOP
```

### Frontend (Angular)
```
src/app/
├── core/               # Interceptors, Guards, Services globaux
├── features/           # Modules métier (Auth, Leave, Attendance, Admin)
├── shared/             # Composants UI, Pipes, Directives réutilisables
└── store/              # Gestion d'état (Signals / Services)
```

---

## 🚀 Installation & Démarrage

### Prérequis
*   JDK 17+
*   Node.js (v20+)
*   Docker & Docker Compose
*   Maven

### 1. Cloner le projet
```bash
git clone https://github.com/Mahjoubech/DayOff.git
cd DayOff
```

### 2. Lancer via Docker (Recommandé)
```bash
docker-compose up --build
```
*L'application sera accessible sur `http://localhost:4200` et l'API sur `http://localhost:8080`.*

### 3. Installation manuelle
**Backend :**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Frontend :**
```bash
cd frontend
npm install
npm start
```

---

## ⚙️ CI/CD & Qualité

Le projet intègre un pipeline **Jenkins** complet défini dans le `Jenkinsfile` :
*   **Checkout** : Récupération du code source.
*   **Backend Build & Test** : Compilation Maven et exécution des tests unitaires.
*   **Analyse de Qualité** : Génération de rapports de couverture avec **JaCoCo**.
*   **Frontend Build** : Build de l'application Angular pour la production.
*   **Dockerization** : Construction et push des images Docker sur Docker Hub.
*   **Deployment** : Déploiement automatisé sur le serveur de production.

---

## ✅ Compétences Validées

*   [x] **Développement Backend** : Spring Boot, JPA, Spring Security, JWT.
*   [x] **Développement Frontend** : Angular 19, Tailwind CSS 4, RxJS.
*   [x] **Gestion de Données** : PostgreSQL, Modélisation Relationnelle.
*   [x] **DevOps** : Docker, Jenkins, CI/CD Pipelines.
*   [x] **Qualité Logicielle** : Tests unitaires (JUnit), Couverture de code (JaCoCo).
*   [x] **Temps Réel** : WebSockets (STOMP/SockJS).

---

*Développé par [Mahjoub Cherkaoui] - Avril 2026*
