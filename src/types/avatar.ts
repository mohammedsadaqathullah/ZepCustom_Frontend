import { genConfig } from 'react-nice-avatar';
import type { AvatarFullConfig } from 'react-nice-avatar';

export type AvatarConfig = AvatarFullConfig;

export const DEFAULT_AVATAR: AvatarConfig = genConfig();

// Helper to generate random avatar
export function generateRandomAvatar(): AvatarConfig {
    return genConfig();
}

// Re-export constants if needed for custom UI, but react-nice-avatar handles most logic
// We can keep these if we want to build a custom UI, but for now we'll rely on the library's config
