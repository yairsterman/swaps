// noinspection JSAnnotator
let config = {
    tranzillaTokenSupplier: 'swapshomtok',
    tranzillaTokenPassword: 'cyrUkT3',
    tranzillaSupplier: 'swapshom',
    tranzillaPassword: 'QWavKI9',
    TranzilaPW: 'FGf4ygrh',
    CreditPass: 'Gg54hth',
    tranzilaRequestUrl: `https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi`,
    tranzilaGetIndexUrl: `https://secure5.tranzila.com/cgi-bin/billing/tranzila_dates.cgi`,

    googleClientId: '678609024087-1c99lheaitodb9c8bv13ptctlj3fh2t4.apps.googleusercontent.com',
    googleClientSecret: 'mJXTYyWlF-QeizGN6gWGIlF2',

    geoCoderOptions: {
        provider: 'google',
        // Optional depending on the providers
        httpAdapter: 'https', // Default
        apiKey: 'AIzaSyBWmFeAXp3C9w8cwVHu6emXoQpmgJis9Hw', // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
    },

    FACEBOOK_APP_ID: '1628077027210389',
    FACEBOOK_APP_SECRET: '5a927f2caa3f5eb9a2eeaad0eaf1b225',

    jwtSecret: 'swapstick' ,

    cloudinaryName: 'swaps',
    cloudinaryKey: '141879543552186',
    cloudinarySecret: 'DzracCkoJ12usH_8xCe2sG8of3I',

    ADMIN_PASSWORD: 'q3e5t7u',

    saltRounds: 10,

    // mongoUrl: 'mongodb://18.221.167.219/test', // for dev
    mongoUrl: 'mongodb://127.0.0.1/test', // for production

    baseUrl: 'https://swapshome.com'
    // baseUrl: 'http://localhost:3000'
};

module.exports = config;