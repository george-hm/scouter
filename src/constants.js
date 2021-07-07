const nacl = require('tweetnacl');

class Constants {
    static createResponse(status, message) {

    }

    static validateRequest(event) {
        // Your public key can be found on your application in the Developer Portal
        const PUBLIC_KEY = 'APPLICATION_PUBLIC_KEY';

        const signature = event.get('X-Signature-Ed25519');
        const timestamp = event.get('X-Signature-Timestamp');
        const body = event.rawBody; // rawBody is expected to be a string, not raw bytes

        const isVerified = nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, 'hex'),
            Buffer.from(PUBLIC_KEY, 'hex'),
        );

        return isVerified;
    }
}

module.exports = Constants;
