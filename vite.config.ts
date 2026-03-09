import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import type { Plugin } from 'vite';

function doubaoApiPlugin(apiKey: string): Plugin {
  return {
    name: 'doubao-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/qwen-chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              const { messages, max_tokens = 400, temperature = 0.85, stream = false } = JSON.parse(body);
              const apiRes = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ model: 'ep-20260306165624-l9cfw', messages, max_tokens, temperature, stream }),
              });

              res.statusCode = apiRes.status;

              if (stream && apiRes.ok && apiRes.body) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                const reader = (apiRes.body as any).getReader();
                const pump = async () => {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) { res.end(); break; }
                    res.write(value);
                  }
                };
                pump().catch(() => res.end());
              } else {
                const data = await apiRes.json();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              }
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: '代理错误' }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        ...(env.VITE_DOUBAO_API_KEY ? [doubaoApiPlugin(env.VITE_DOUBAO_API_KEY)] : []),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.svg', 'apple-touch-icon.png'],
          manifest: {
            name: '小宁陪你',
            short_name: '小宁陪你',
            description: '你的情绪小伙伴 · 宁静岛。小宁懂你，陪你慢慢好起来。',
            theme_color: '#6366f1',
            background_color: '#fdfdff',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
              { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
              },
              {
                urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
                handler: 'CacheFirst',
                options: { cacheName: 'tailwind-cache', expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 } },
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.HAS_GEMINI_KEY': JSON.stringify(!!env.VITE_GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
