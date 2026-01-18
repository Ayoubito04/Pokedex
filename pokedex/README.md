# 📱 Pokédex - Gen 5 / Unova Style

Una aplicación de Pokédex moderna y responsiva construida con **React** y **Vite**, inspirada en la estética tecnológica de la 5ª Generación (Región de Unova/Teselia).

![Pokedex Preview](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/494.png)

## ✨ Características Principales

- **🔍 Búsqueda Instantánea**: Filtra entre los más de 1000 Pokémon por nombre o número de ID en tiempo real.
- **✨ Modo Shiny**: ¡Descubre las versiones variocolor! Interruptor interactivo en la tarjeta de cada Pokémon para alternar entre su forma Normal y Shiny.
- **⚔️ Gestión de Equipo**: Construye tu equipo de ensueño de 6 Pokémon. Los datos se guardan automáticamente.
- **🗺️ Mapa Regional**: Explora información sobre las diferentes regiones del mundo Pokémon, desde Kanto hasta Paldea.
- **🎨 UI Temática**: Interfaz de usuario inmersiva con efectos holográficos, sonidos visuales y paleta de colores oscura estilo "Tech".
- **📱 Totalmente Responsivo**: Diseño optimizado para funcionar perfectamente en móviles, tablets y escritorio.

## 🛠️ Tecnologías

- **React 19**: Biblioteca principal de UI.
- **React Router**: Para la navegación SPA (Single Page Application).
- **CSS3**: Variables CSS, Flexbox, Grid y animaciones personalizadas.
- **Context API**: Para la gestión del estado global del equipo Pokémon.
- **PokeAPI**: Fuente de datos para obtener información de los Pokémon.

## 🚀 Instalación y Uso

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio-url>
   cd pokedex
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

## ☁️ Despliegue en Vercel

Este proyecto está optimizado para desplegarse en Vercel.

1. Sube tu código a GitHub.
2. Ve a [Vercel.com](https://vercel.com) e inicia sesión.
3. Haz clic en **"Add New..."** -> **"Project"**.
4. Importa tu repositorio de GitHub.
5. **IMPORTANTE**: En la configuración del proyecto ("Build & Development Settings"):
   - **Root Directory**: Haz clic en "Edit" y selecciona la carpeta `pokedex`.
   - **Framework Preset**: Vercel debería detectar "Vite" automáticamente.
6. Haz clic en **Deploy**.

¡Tu Pokédex estará online en segundos!

## 📝 Estructura del Proyecto

- `/src/components`: Componentes modulares (PokeCard, MyTeam, RegionMap).
- `/src/context`: Gestión de estado global (TeamContext).
- `/src/styles`: Temas y variables CSS globales.

---
Desarrollado con ❤️ usando React.
