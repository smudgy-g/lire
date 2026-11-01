import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
export default { plugins: [sveltekit({ adapter: adapter({ split: true }), alias: { '$lib': 'src/lib' } })] };
