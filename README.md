# Acuarela / Acuario-Bar - Sistema Gastronómico QR en Tiempo Real

Sistema de pedidos por mesa mediante código QR para restaurantes, con carta interactiva, división de cuentas, sincronización en vivo vía Firebase Firestore y panel de gestión en cocina y caja.

## Tecnologías
- **Frontend**: React, Vite, Tailwind CSS v4, Lucide React, Sonner
- **Base de Datos**: Firebase Firestore en tiempo real
- **Despliegue**: GitHub Pages

## Módulos
1. **Cliente Móvil (`/#/mesa/:id`)**: Menú interactivo, carrito en vivo, consumo acumulado y sistema de anfitrión/PIN.
2. **Dashboard de Caja (`/#/dashboard`)**: Gestión Kanban de comandas, tasa BCV en tiempo real y cobro/liberación de mesas.
3. **Generador de QR (`/#/qr`)**: Generación e impresión de códigos QR para mesas.
