import { z } from 'zod';

const envSchema = z.object({
    BOT_TOKEN: z.string().min(1),
    // Supabase 配置
    SUPABASE_URL: z.string().min(1),
    SUPABASE_SERVICE_KEY: z.string().min(1),
    // 频道ID（可选）
    CHANNEL_ID: z.string().optional(),
});

type EnvVariables = z.infer<typeof envSchema>;

function loadEnv(): EnvVariables {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Missing or invalid environment variables:', error.errors);
        } else {
            console.error('Failed to load environment variables:', error);
        }
        process.exit(1);
    }
}

export const config = loadEnv(); 