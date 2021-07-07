const nacl = require('tweetnacl');

class Constants {
    static createResponse(status, body) {
        let bodyToUse = body;
        if (!bodyToUse) {
            bodyToUse = '{}';
        }

        if (typeof bodyToUse === 'object') {
            bodyToUse = JSON.stringify(bodyToUse);
        }

        return {
            statusCode: status,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: bodyToUse,
        };
    }

    static validateRequest(event) {
        // Your public key can be found on your application in the Developer Portal
        const PUBLIC_KEY = process.env.PUBLIC_KEY;

        const signature = event.headers['x-signature-ed25519'];
        const timestamp = event.headers['x-signature-timestamp'];
        const body = event.body;
        if (!body) {
            return false;
        }

        const isVerified = nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, 'hex'),
            Buffer.from(PUBLIC_KEY, 'hex'),
        );

        return isVerified;
    }
}

module.exports = Constants;
