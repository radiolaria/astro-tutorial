import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { createClient } from "microcms-js-sdk";

const client = createClient({
 serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
 apiKey: import.meta.env.MICROCMS_API_KEY,
});

// microCMSのコンテンツローダー
const microCMSLoader = (endpoint: string) => {
 return async () => {
   try {
     console.log(`microCMSから${endpoint}データを取得中...`);
     const response = await client.getAllContents({
       endpoint
     });
     console.log(`${response.length}件の${endpoint}を取得しました`);
     return response;
   } catch (error) {
     console.error(`microCMSからの${endpoint}取得に失敗:`, error);
     return [];
   }
 };
};

// 共通のフィールド
const microCMSDateFields = {
 createdAt: z.string(),
 updatedAt: z.string(),
 publishedAt: z.string(),
 revisedAt: z.string(),
};

// コレクションの定義
const news = defineCollection({
 loader: microCMSLoader('news'),
 schema: z.object({
   title: z.string(),
   body: z.string(),
   ...microCMSDateFields,
 }),
});



const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

export const collections = { 
	'blog': blog,
	'news': news,
};
