exports.config = {  
    capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {                
            args: ['--disable-web-security']
        } 
    },
    baseUrl: 'http://localhost:8100',
    framework: 'jasmine2',
    specs: [
        '*.tests.js'
    ],
    jasmineNodeOpts: {
        isVerbose: true,
    }
};