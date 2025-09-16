# 🤖 NLP-Vitae

**Sistema inteligente de procesamiento y análisis de CVs basado en microservicios**

NLP-Vitae es una plataforma avanzada que utiliza técnicas de Procesamiento de Lenguaje Natural (NLP) para extraer, procesar y analizar información de currículums vitae en formato PDF. El sistema emplea una arquitectura de microservicios para ofrecer escalabilidad, modularidad y alta disponibilidad.

## 🚀 Características principales

### 📄 **Procesamiento automático de CVs**
- **Extracción OCR**: Conversión de PDFs a texto utilizando Docling
- **Reconocimiento de entidades (NER)**: Identificación automática de datos personales, experiencia laboral, educación, habilidades técnicas e idiomas
- **Extracción de imágenes**: Detección y almacenamiento de fotos de perfil
- **Procesamiento asíncrono**: Cola de trabajos para manejar múltiples documentos

### 🔍 **Motor de búsqueda inteligente**
- **Filtros por tecnologías**: Tarjetas interactivas para seleccionar frameworks y lenguajes de programación
- **Búsqueda textual**: Filtrado por nombre de archivo
- **Puntuación de relevancia**: Algoritmo de scoring basado en coincidencias tecnológicas
- **Interfaz visual atractiva**: Resultados con fotos de perfil y tags de tecnologías

### 📊 **Interfaz de usuario**
- **SPA con React**: Aplicación de página única responsive
- **Componentes reutilizables**: DataTable, Modal, SearchCards, ExtractedView
- **Diseño profesional**: Tailwind CSS para un UI/UX moderno
- **Estado global**: Gestión eficiente con Zustand y React Query

### 🏗️ **Arquitectura de microservicios**
- **API Gateway**: Centralización de endpoints y gestión de archivos
- **Servicios especializados**: OCR, NER, CV y LLM independientes
- **Base de datos NoSQL**: MongoDB con GridFS para almacenamiento de archivos
- **Contenedorización**: Docker Compose para orquestación completa

## 🛠️ Stack tecnológico

### Backend
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

### DevOps & Tools
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

## 🏛️ Arquitectura del sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend SPA  │◄──►│   API Gateway   │◄──►│    MongoDB      │
│    (React)      │    │   (FastAPI)     │    │   + GridFS      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Microservicios    │
                    └─────────────────────┘
                               │
        ┌──────────────┬───────┼───────┬──────────────┐
        ▼              ▼       ▼       ▼              ▼
 ┌──────────┐  ┌──────────┐ ┌────┐ ┌──────────┐ ┌──────────┐
 │    OCR   │  │   NER    │ │ CV │ │   LLM    │ │  Timer   │
 │(Tesseract)│ │(PyTorch) │ │    │ │ (Ollama) │ │ Workers  │
 └──────────┘  └──────────┘ └────┘ └──────────┘ └──────────┘
```

### Componentes principales

#### 🌐 **API Gateway (Puerto 8888)**
- **Gestión de archivos**: Upload, download, filtrado por ID/fecha
- **Endpoints de imágenes**: Servicio de fotos de perfil extraídas
- **CORS configurado**: Comunicación segura con el frontend
- **Validación de datos**: Schemas con Pydantic

#### 👁️ **Servicio OCR (Puerto 9000)**
- **Tesseract Engine**: Extracción de texto de PDFs e imágenes
- **Docling Integration**: Procesamiento avanzado de documentos
- **Soporte multiidioma**: Español e inglés configurados
- **API de versión**: Endpoint para verificar versión de Tesseract

#### 🧠 **Servicio NER (Puerto 9001)**
- **Modelo personalizado**: Red neuronal entrenada para CVs
- **Extracción de entidades**: Datos personales, experiencia, educación, habilidades
- **Procesamiento en lotes**: Cola de trabajos asíncrona
- **Métricas de modelo**: Información detallada del modelo utilizado

#### 📋 **Servicio CV (Puerto 9002)**
- **Análisis de estructura**: Identificación de secciones del CV
- **Extracción de imágenes**: Detección y almacenamiento de fotos de perfil
- **Procesamiento complementario**: Análisis adicional de contenido

#### 🤖 **Servicio LLM (Puerto 11435)**
- **Ollama Integration**: Modelos de lenguaje grandes locales
- **Llama3 preconfigurado**: Modelo base para tareas de NLP avanzadas
- **API REST**: Interfaz estándar para consultas a modelos

#### 🗄️ **Base de datos MongoDB (Puerto 27018)**
- **Almacenamiento de metadatos**: Información de archivos procesados
- **GridFS**: Almacenamiento eficiente de PDFs y imágenes
- **Índices optimizados**: Búsquedas rápidas por ID y fecha
- **Autenticación**: Usuario y contraseña configurados

#### ⚛️ **Frontend SPA (Puerto 5173)**
- **React 18**: Framework moderno con hooks
- **TypeScript**: Tipado estático para mayor robustez
- **React Router**: Navegación entre páginas (Home, Search, Settings)
- **React Query**: Gestión eficiente de estado del servidor
- **Tailwind CSS**: Framework de utilidades para diseño responsive

## 📁 Estructura del proyecto

```
NLP-Vitae/
├── Services/
│   ├── API/                    # Gateway principal y gestión de archivos
│   │   ├── app.py             # FastAPI app con endpoints principales
│   │   ├── Components/
│   │   │   ├── Files/         # Lógica de gestión de archivos
│   │   │   └── Mongo/         # Conexión a base de datos
│   │   └── Dockerfile
│   ├── OCR/                   # Servicio de reconocimiento óptico
│   │   ├── app.py            # FastAPI app para OCR
│   │   ├── Components/
│   │   │   ├── Utilities/    # Workers y managers
│   │   │   └── Mongo/
│   │   └── Dockerfile
│   ├── NER/                  # Servicio de reconocimiento de entidades
│   │   ├── app.py
│   │   ├── Components/
│   │   │   ├── Model/        # Modelo de ML personalizado
│   │   │   ├── Utilities/
│   │   │   └── Mongo/
│   │   └── Dockerfile
│   ├── CV/                   # Servicio de análisis de CV
│   │   ├── app.py
│   │   ├── Components/
│   │   └── Dockerfile
│   ├── LLM/                  # Servicio de modelos de lenguaje
│   │   └── Dockerfile
│   ├── SPA/                  # Aplicación frontend
│   │   ├── src/
│   │   │   ├── components/   # Componentes reutilizables
│   │   │   ├── pages/        # Páginas principales
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── api/          # Cliente de API
│   │   │   └── state/        # Gestión de estado
│   │   ├── package.json
│   │   └── Dockerfile
│   └── Mongo/
│       └── mongo-init.js     # Script de inicialización de BD
├── docker-compose.yml        # Orquestación de servicios
└── README.md
```

## 🚀 Instalación y uso

### Prerrequisitos
- Docker y Docker Compose instalados
- Git para clonar el repositorio
- 4GB+ RAM disponible para los servicios

### Instalación rápida

1. **Clonar el repositorio**
```bash
git clone ESTE_REPOSITORIO
cd NLP-Vitae
```

2. **Levantar todos los servicios**
```bash
docker-compose up -d
```

3. **Verificar que los servicios estén corriendo**
```bash
docker-compose ps
```

### URLs de acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación web principal |
| **API Gateway** | http://localhost:8888 | API REST y documentación |
| **Swagger API** | http://localhost:8888/docs | Documentación interactiva |
| **OCR Service** | http://localhost:9000/docs | Documentación del servicio OCR |
| **NER Service** | http://localhost:9001/docs | Documentación del servicio NER |
| **CV Service** | http://localhost:9002/docs | Documentación del servicio CV |
| **LLM Service** | http://localhost:11435 | Servicio de modelos de lenguaje |
| **MongoDB** | localhost:27018 | Base de datos (acceso interno) |

## 📖 Guía de uso

### 1. Subir un CV
1. Accede a http://localhost:5173
2. Haz clic en "Seleccionar archivo" y elige un PDF
3. Presiona "Subir archivo"
4. El sistema procesará automáticamente el documento

### 2. Buscar candidatos
1. Ve a la pestaña "Búsqueda"
2. Selecciona tecnologías usando las tarjetas interactivas
3. Opcionalmente, filtra por nombre de archivo
4. Explora los resultados ordenados por relevancia
5. Haz clic en "Ver detalles" para información completa

### 3. Ver detalles de un CV
- **Vista estructurada**: Datos personales, experiencia, educación, habilidades
- **Foto de perfil**: Si está disponible en el CV
- **Tecnologías detectadas**: Con indicadores de coincidencia
- **Puntuación de relevancia**: Basada en filtros aplicados

## 🔧 Configuración avanzada

### Variables de entorno

#### Frontend (SPA)
```env
VITE_API_BASE_URL=http://localhost:8888
```

#### MongoDB
```env
MONGO_INITDB_ROOT_USERNAME=nlpadmin
MONGO_INITDB_ROOT_PASSWORD=nlppass
```

### Personalización del modelo NER
El servicio NER utiliza un modelo personalizado entrenado para CVs. Para usar tu propio modelo:

1. Reemplaza el archivo modelo en `Services/NER/Components/Model/`
2. Actualiza la configuración en `Components/Model/LLM.py`
3. Reconstruye el contenedor: `docker-compose build ner`

### Configuración de Tesseract
Para agregar más idiomas al OCR:

1. Modifica el Dockerfile en `Services/OCR/`
2. Agrega paquetes de idioma: `tesseract-ocr-fra tesseract-ocr-deu`
3. Reconstruye: `docker-compose build ocr`

## 🔍 API Reference

### Endpoints principales

#### Gestión de archivos
```http
POST /upload                    # Subir PDF
GET  /file/all                 # Listar todos los archivos
GET  /file/filter/id/{file_id} # Obtener archivo por ID
GET  /download/{file_id}       # Descargar PDF original
```

#### Imágenes de perfil
```http
GET /file/picture/{picture_id}           # Obtener imagen por ID
GET /file/picture/by-file/{file_id}      # Obtener imagen por archivo
```

#### Health checks
```http
GET :8888/health   # Estado del API Gateway
GET :9000/health   # Estado del servicio OCR
GET :9001/health   # Estado del servicio NER
GET :9002/health   # Estado del servicio CV
```

### Formato de respuesta

#### Archivo procesado
```json
{
  "id": "668c95f84eca58ee7afa67143",
  "file_id": "8438e631-d648-4cb2-928b-66ead35d4eaa",
  "name": "PEDRO_DIAZ_CV.pdf",
  "creation_date": "16-09-2025 10:00:52",
  "results": [
    {
      "process": "Docling",
      "data": "## DETALLES PERSONALES\n\n- Nombre Pedro Diaz...",
      "duration": 16.403708
    },
    {
      "process": "NER",
      "data": {
        "datos_personales": {
          "nombre": "Pedro Diaz",
          "correo_electronico": "pedro@email.com"
        },
        "experiencia_laboral": [...],
        "educacion": [...],
        "habilidades_tecnicas": [...]
      },
      "duration": 323.85308
    },
    {
      "process": "CV",
      "data": "Profile pictured extracted with _id: 68c961d3debc2b9497c5625b"
    }
  ]
}
```

### Test de integración
```bash
# Verificar que todos los servicios respondan
curl http://localhost:8888/health
curl http://localhost:9000/health
curl http://localhost:9001/health
curl http://localhost:9002/health
```

---