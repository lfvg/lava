import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

export default {
  name: "@electron-forge/maker-deb",
  packagerConfig: {
    name: "Lava",
    asar: true,
  },
  rebuildConfig: {
    force: true
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',  //Windows
      config: {
        name: 'Lava',
      },
    },
    {
      name: '@electron-forge/maker-zip',  //macOS
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-dmg',  //macOs
      config: {
        background: './src/assets/dmg-background.png',
        icon: './src/assets/icon.icns',
        format: 'ULFO',
      }
    },
    {
      name: '@electron-forge/maker-deb',  //Linux
      platforms: ['linux'],
      config: {
        description: "A chat application using Llama3.2.",
        productDescription: "Lava is a chat application that utilizes the Llama3.2 model for intelligent conversations."
      },
    },
    {
      name: '@electron-forge/maker-rpm',  //Linux
      config: {
        description: "A chat application using Llama3.2.",
        productDescription: "Lava is a chat application that utilizes the Llama3.2 model for intelligent conversations."
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};