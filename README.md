# Transporte MAHE

Sitio web de Transporte MAHE — transporte de personal empresarial en Querétaro, México.

Sitio estático (HTML/CSS/JS puro, sin build step), listo para desplegarse en Cloudflare Pages.

## Desarrollo local

Cualquier servidor estático sirve. Ejemplo con Node:

```bash
npx serve .
```

## Despliegue en Cloudflare Pages

1. Sube este repositorio a GitHub.
2. En el dashboard de Cloudflare, ve a **Workers & Pages → Create → Pages → Connect to Git**.
3. Selecciona este repositorio.
4. Framework preset: **None**. Build command: (vacío). Output directory: `/`.
5. Deploy. Después conecta el dominio `transportemahe.com` en la pestaña **Custom domains** del proyecto.
