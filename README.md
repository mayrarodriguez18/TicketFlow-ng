# TicketFlow NG

Sistema de Mesa de Ayuda e Incidencias (Help Desk) construido con **NestJS**, **TypeORM** y **PostgreSQL**.

## Tecnologías

- **Runtime:** Node.js / NestJS 11
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL con TypeORM
- **Autenticación:** JWT + Passport.js
- **Documentación:** Swagger (OpenAPI)
- **Validación:** class-validator / class-transformer
- **Testing:** Jest + Supertest

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm

## Instalación

```bash
git clone https://github.com/mayrarodriguez18/TicketFlow-ng.git
cd TicketFlow-ng
npm install
```

## Configuración

Crear un archivo `.env` en la raíz del proyecto:


```

## Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Seed de datos iniciales
npm run seed
```

La API corre en `http://localhost:3000/api` y la documentación Swagger en `http://localhost:3000/api/docs`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Inicia el servidor en modo desarrollo con hot-reload |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm run start:prod` | Inicia en producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run test` | Ejecuta tests unitarios |
| `npm run test:e2e` | Ejecuta tests end-to-end |
| `npm run seed` | Puebla la base de datos con datos iniciales |

## Endpoints

### Salud
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Health check |

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión (devuelve JWT) |

### Usuarios (requiere ADMIN)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/users` | Crear usuario |
| GET | `/users` | Listar usuarios |
| GET | `/users/:id` | Obtener usuario |
| PATCH | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |

### Tickets (requiere autenticación)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/tickets` | Crear ticket |
| GET | `/tickets` | Listar tickets |
| GET | `/tickets/:id` | Obtener ticket |
| PATCH | `/tickets/:id` | Actualizar ticket |
| POST | `/tickets/:id/assign/:agentId` | Asignar ticket (ADMIN/AGENT) |
| PATCH | `/tickets/:id/status/:status` | Cambiar estado |
| DELETE | `/tickets/:id` | Eliminar ticket (ADMIN) |

### Categorías
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/categories` | Crear (ADMIN) |
| GET | `/categories` | Listar todas |
| GET | `/categories/:id` | Obtener una |
| PATCH | `/categories/:id` | Actualizar (ADMIN) |
| DELETE | `/categories/:id` | Eliminar (ADMIN) |

### Comentarios (requiere autenticación)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/comments` | Crear comentario |
| GET | `/comments/ticket/:ticketId` | Comentarios de un ticket |
| DELETE | `/comments/:id` | Eliminar (solo autor) |

### Archivos (requiere autenticación)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/uploads` | Subir archivo (imagen/PDF, máx 5 MB) |

### Reportes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/reports/dashboard` | Resumen del dashboard |
| GET | `/reports/by-status` | Tickets por estado (ADMIN) |
| GET | `/reports/by-agent` | Tickets por agente (ADMIN) |

## Roles

- **admin** — Acceso total al sistema
- **agent** — Puede gestionar tickets asignados
- **user** — Puede crear y dar seguimiento a sus tickets

## Estructura del proyecto

```
src/
├── auth/          # Autenticación (register, login, JWT strategy)
├── users/         # Gestión de usuarios
├── tickets/       # Gestión de tickets
├── categories/    # Categorías de tickets
├── comments/      # Comentarios en tickets
├── uploads/       # Subida de archivos
├── reports/       # Reportes y estadísticas
├── common/        # Guards, decorators, filtros
├── config/        # Configuración
├── app.module.ts  # Módulo principal
└── main.ts        # Punto de entrada
```
