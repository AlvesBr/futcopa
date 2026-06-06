import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
  // Disable webpack cache to avoid conflict between @storybook/nextjs 8.6 and Next.js 14 bundled webpack
  webpackFinal: async (config) => {
    config.cache = false
    return config
  },
}

export default config
