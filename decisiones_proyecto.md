# Registro de Decisiones del Proyecto — Método Bianchi®

Este documento registra las decisiones arquitectónicas, de producto y de despliegue acordadas durante el desarrollo de la aplicación.

---

## 1. Repositorio y Despliegue
*   **Usuario de GitHub:** `malikes-coder` (cuenta activa utilizada para la gestión de código).
*   **Repositorio GitHub:** `metodo-bianchi` ([https://github.com/malike-coder/metodo-bianchi.git](https://github.com/malike-coder/metodo-bianchi.git)).
*   **Proyecto en Vercel:** `metodo-bianchi` (desplegado directamente importando desde GitHub).

---

## 2. Modelo de Acceso y Seguridad de Vistas
*   **Cuestionario de Evaluación (Público y Gratuito):**
    *   Cualquier cliente puede ingresar libremente, completar el wizard sensorial de 8 pasos, subir fotos en sesión y obtener su Índice IBBH e informe narrativo en pantalla.
    *   No requiere registro previo para fomentar el alcance masivo.
*   **Panel Bianchi Estudio / Diseñadora (Protegido por Contraseña):**
    *   El switcher de roles en la cabecera ("Panel Bianchi Estudio") y la vista del panel administrativo (`ProfessionalPanel.tsx`) deben bloquearse bajo credenciales de acceso.
    *   En producción, el login de profesionales se validará mediante **Supabase Auth** para asegurar que solo el equipo de diseño pueda auditar clientes, ver históricos y ajustar claves del sistema.

---

## 3. Arquitectura y Evidencia Científica
*   **Evidencia Científica Trazable:**
    *   Se reemplazaron referencias informales por estudios con referato (Peer-Reviewed), como el estudio de **Saxbe & Repetti (2010)** sobre desorden doméstico y niveles de cortisol salivar.
*   **Privacidad de Datos (MVP):**
    *   Las imágenes cargadas por los usuarios se procesan temporalmente durante su sesión activa a través de la API de Gemini Vision y no se almacenan de manera persistente en servidores externos, cumpliendo con el descargo del consentimiento informado.
*   **Modelos de IA en Producción (Actualizados):**
    *   **`gemini-2.5-flash`** para análisis multimodal de imágenes (luz, orden, biofilia en Paso 8).
    *   **`gemini-2.5-pro`** para redactar narrativas diagnósticas personalizadas y mapeo detallado.
