const nacl = require('tweetnacl');
const InteractionResponse = require('./model/discord/InteractionResponse.js');

class Constants {
    static createResponse(body, status) {
        let bodyToUse = body;
        if (!bodyToUse) {
            bodyToUse = '{}';
        }

        if (bodyToUse instanceof InteractionResponse) {
            bodyToUse = JSON.stringify(bodyToUse.toObject());
        }

        if (typeof bodyToUse === 'object') {
            bodyToUse = JSON.stringify(bodyToUse);
        }

        return {
            statusCode: status || 200,
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

    static getSNSMessageFromEvent(event) {
        const message = event?.Records?.[0]?.Sns?.Message;
        if (!message) {
            throw new Error('Missing SNS payload');
        }

        if (typeof message !== 'string') {
            throw new Error('Invalid message, must be string');
        }

        try {
            return JSON.parse(message);
        } catch (err) {
            throw new Error(`Invalid JSON: ${message}`);
        }
    }
}

module.exports = Constants;
