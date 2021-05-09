module.exports = {
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    darkMode: false, // or 'media' or 'class'
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true
    },
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
