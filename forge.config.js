import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'node:path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "@electron-forge/maker-deb",
  packagerConfig: {
    name: "Lava",
    icon: path.join(__dirname, 'src', 'assets', 'volcano'),//'/src/assets/volcano',
    extraResource: [
      path.join(__dirname, 'src', 'assets', 'volcano.icns'),
    ],
    asar: true,
    osxSign: false,
  },
  rebuildConfig: {
    force: true
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',  //Windows
      config: {
        name: 'Lava',
        setupIcon: path.join(__dirname, 'src', 'assets', 'volcano.ico'),
      },
    },
    {
      name: '@electron-forge/maker-zip',  //macOS
      icon: path.join(__dirname, 'src', 'assets', 'volcano.icns'), 
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-dmg',  //macOs
      icon: path.join(__dirname, 'src', 'assets', 'volcano.icns'),
      config: {
        background: './src/assets/background.png',
        icon: path.join(__dirname, 'src', 'assets', 'volcano.png'),
        format: 'ULFO',
      }
    },
    {
      name: '@electron-forge/maker-deb',  //Linux
      platforms: ['linux'],
      config: {
        description: "A chat application using Llama3.2.",
        productDescription: "Lava is a chat application that utilizes the Llama3.2 model for intelligent conversations.",
        options: {
          icon: path.join(__dirname, 'src', 'assets', 'volcano.png')
        }
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