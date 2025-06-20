module.exports = {
    // Lint & Prettify TS and JS files
    '**/*.(ts|tsx|js|jsx)': (filenames) => [
        `next lint --fix --file ${filenames.join(' --file ')}`,
        // Type check all TypeScript files (not just staged ones for accuracy)
        'tsc --noEmit',
        'git add',
    ],
    // Prettify other supported files
    '**/*.(json|css|md|mdx|html|yml|yaml)': (filenames) => [
        `prettier --write ${filenames.join(' ')}`,
        'git add',
    ],
} 