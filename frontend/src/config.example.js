// Input your token here
let TOKEN = '';
let DATABASE_URL = ''
let GOBACKEND_URL = ''

// change to forwarder if the user is visiting this website outside the school
if (window.location.hostname === "outside.ccc.8bits.io") {
    DATABASE_URL.replace('www.ccc.8bits.io', 'outside.ccc.8bits.io')
    GOBACKEND_URL.replace('www.ccc.8bits.io', 'outside.ccc.8bits.io')
}

export {TOKEN, DATABASE_URL, GOBACKEND_URL};
