import JSZip from 'jszip';
import { getBotJsContent } from './botTemplate';

export { getBotJsContent };

export async function generateBotZip(botToken?: string): Promise<Blob> {
  const zip = new JSZip();

  const tokenToUse = (botToken && botToken.trim()) ? botToken.trim() : 'COLLEZ_VOTRE_TOKEN_DISCORD_ICI';

  // 1. package.json
  const packageJson = {
    name: 'bot-zelephants-parapente',
    version: '1.0.0',
    description: "Bot Discord officiel du club Parapente Z'éléphants pour covoiturages et sorties",
    main: 'bot.js',
    scripts: {
      start: 'node bot.js'
    },
    dependencies: {
      'discord.js': '^14.17.3',
      dotenv: '^16.4.7'
    }
  };
  zip.file('package.json', JSON.stringify(packageJson, null, 2));

  // 2. .env
  zip.file('.env', `DISCORD_BOT_TOKEN=${tokenToUse}\n`);

  // 3. bot.js (avec serveur HTTP REST, commandes /covoit et /sortie, boutons natifs)
  zip.file('bot.js', getBotJsContent());

  // 4. render.yaml
  zip.file('render.yaml', `services:
  - type: web
    name: bot-zelephants-discord
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node bot.js
    envVars:
      - key: DISCORD_BOT_TOKEN
        sync: false
`);

  // 5. .gitignore
  zip.file('.gitignore', "node_modules\n.env\n.DS_Store\n");

  // 6. LANCER_LE_BOT_WINDOWS.bat
  const batScript = `@echo off
chcp 65001 > nul
echo =========================================================
echo    BOT DISCORD - CLUB PARAPENTE LES Z'ÉLÉPHANTS
echo =========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe sur cet ordinateur !
    echo Rendez-vous sur https://nodejs.org pour l'installer (version LTS, 1 clic).
    echo Une fois installe, relancez ce fichier.
    pause
    exit /b
)

if not exist node_modules (
    echo [1/2] Installation des modules Discord (quelques secondes)...
    call npm install
)

echo [2/2] Lancement du Bot Discord...
call node bot.js
pause
`;
  zip.file('LANCER_LE_BOT_WINDOWS.bat', batScript);

  // 5. LANCER_LE_BOT_MAC_LINUX.sh
  const shScript = `#!/bin/bash
echo "========================================================="
echo "   BOT DISCORD - CLUB PARAPENTE LES Z'ÉLÉPHANTS"
echo "========================================================="

if ! command -v node &> /dev/null
then
    echo "[ERREUR] Node.js n'est pas installé sur cet ordinateur."
    echo "Installez-le depuis https://nodejs.org (version LTS)."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[1/2] Installation des modules Discord..."
    npm install
fi

echo "[2/2] Lancement du Bot Discord..."
node bot.js
`;
  zip.file('LANCER_LE_BOT_MAC_LINUX.sh', shScript);

  // 6. LISEZ_MOI_FACILE.txt
  const readMe = `===============================================================
GUIDE FACILE - BOT DISCORD LES Z'ÉLÉPHANTS PARAPENTE
===============================================================

COMMENT ÇA MARCHE EN 2 ÉTAPES :

1. Ouvrez le fichier ".env" avec le Bloc-notes :
   - Vérifiez que votre DISCORD_BOT_TOKEN y est bien présent.
   - Si ce n'est pas le cas, collez-y votre token secret obtenu sur le portail développeur Discord.
   - Enregistrez le fichier (Fichier -> Enregistrer).

2. Lancez le Bot :
   - Sur Windows : Double-cliquez simplement sur "LANCER_LE_BOT_WINDOWS.bat".
   - Sur Mac / Linux : Ouvrez un terminal et tapez "bash LANCER_LE_BOT_MAC_LINUX.sh".

Le message "✅ Bot Z'éléphants connecté avec succès !" s'affiche.
Vos membres peuvent maintenant taper dans Discord :
- /covoit
- ou simplement : !covoit Verel 14h 3
et cliquer sur les boutons [Je monte] !
`;
  zip.file('LISEZ_MOI_FACILE.txt', readMe);

  return await zip.generateAsync({ type: 'blob' });
}
