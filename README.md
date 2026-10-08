# Speak It! by Lê Châu

An English and Vietnamese speech studio for creating listening material.
The Gemini version uses the visitor's own API key. The Azure version supports
English accents and Vietnamese voices, explicit speaker selection, emotion
styles where supported, exact pause markers, an editable audio timeline, and
WAV export.

## Community and license

Contributions, bug reports, and improvements are welcome. Please read the
[Code of Conduct](CODE_OF_CONDUCT.md), [contribution guide](CONTRIBUTING.md),
and [security policy](SECURITY.md).

The project's original code and documentation are licensed under the
[MIT license](LICENSE). Externally hosted images, branding, fonts, libraries,
and vendor services retain their respective rights and licenses; they are not
relicensed by this repository. Replace external assets with assets you own
when adapting the project.

This site is powered by [Netlify](https://www.netlify.com/).

## Development

Node.js 22 or later is required. Run `npm run build` to validate the deployment
package. This repository contains no API credentials. Set the Azure key as a
server-side environment variable when deploying. The Azure backend's origin
check is not authentication; a public shared endpoint requires usage and abuse
controls appropriate to its audience.

## Deployment and features

Nothing has been deployed by Codex. This package updates your existing Gemini app and adds the Azure Free Version at `/free/`.

## Deploy this version

The shared Azure key needs a backend function. **A plain Netlify Drop upload will not install functions.** Use a Netlify repository build (or Netlify CLI deployment), rather than dragging only the HTML or ZIP onto the site's overview page.

1. Put the contents of this folder into the repository connected to your existing Netlify site. If the site is manual-only, connect a repository containing these files under the site's build/deploy configuration. The included `netlify.toml` sets the build command, publish folder, functions folder, and routes.
2. In your Netlify site's Environment variables, add **AZURE_SPEECH_KEY** with the same key you already supplied, and **AZURE_SPEECH_REGION** with **eastus**. Enable the key for Functions/runtime use. The key is intentionally absent from this ZIP and all browser files. Your local preview still keeps its private key in its own server file.
3. Run one production build/deploy yourself. Open your main app and click **Free Version**. Azure connects automatically there.

You can also deploy this folder with the official Netlify CLI after setting the environment variables: `netlify deploy --build --prod`, targeting your existing site ID `94101508-2852-4548-af73-83fee5181de1`.

## Included changes

- The Gemini app has a Free Version button below the API-key link, plus a link beside generation errors.
- The Free Version hides the Azure region badge and enlarges the original Speak It logo and author name.
- English and Vietnamese voices only, grouped under full accent names such as American English, British English, Australian English, and Vietnamese. Each voice also shows its group in the selected value.
- Emotions remain available in dialogue mode if at least one selected voice supports them. The emotion applies to supporting voices; any other voice keeps its default tone. A short note identifies those voices.
- Original layout, per-marker pauses, preview reuse, speed, clip positioning, playback, zoom and WAV export remain.

## Shared free allowance

All visitors share your Azure Speech F0 quota. F0 limits still apply; this is not unlimited speech. Netlify may also meter function requests and traffic under your hosting plan. The backend does not publish your key or store generated audio. It restricts requests to the same website, but this is not authentication or a full abuse-prevention system. Keep the resource on F0. The key remains valid unless regenerated/revoked or the resource/account access changes.
