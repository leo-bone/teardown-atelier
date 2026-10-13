import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5180, host: '127.0.0.1' },
  build: { target: 'es2020', chunkSizeWarningLimit: 1600 },
  // 部署到 GitHub Pages 的项目子路径（leo-bone.github.io/teardown-atelier/）时，
  // 默认的 base:'/' 会生成 /assets/... 绝对路径，解析到域名根目录而 404。
  // 用 './' 让资源相对化，本地开发和 Pages 上都能跑。
  base: './',
});
