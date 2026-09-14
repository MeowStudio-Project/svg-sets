import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function serveStaticDir(urlBase: string, dirName: string): Plugin {
  return {
    name: `serve-${dirName}`,
    configureServer(server) {
      server.middlewares.use(urlBase, (req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        const name = decodeURIComponent(url.replace(/^\//, ''))
        const root = path.join(process.cwd(), dirName)
        const filePath = path.join(root, name)
        if (!filePath.startsWith(root)) {
          next()
          return
        }
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          if (filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
          } else if (filePath.endsWith('.zip')) {
            res.setHeader('Content-Type', 'application/zip')
          }
          fs.createReadStream(filePath).pipe(res)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    serveStaticDir('/archives', 'archives'),
    serveStaticDir('/json', 'json'),
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
})
