module.exports = {
    // Lint & Prettify TS and JS files
    '**/*.(ts|tsx|js|jsx)': (filenames) => [
        `next lint --fix --file ${filenames.join(' --file ')}`,
        'git add',
    ],
} 