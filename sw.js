const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const SimpleWebAuthnServer = require('@simplewebauthn/server');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// IN-MEMORY STORE (Replace with DB for production)
let users = {};
let challenges = {};

const rpId = 'localhost';
const expectedOrigin = ['http://localhost:3000', 'https://your-github-io-link.com'];

// --- HELPERS ---
// Generate a cryptographically strong challenge
function generateChallenge() {
    return crypto.randomBytes(32).toString('base64url');
}

// --- REGISTRATION ---
app.post('/register/start', (req, res) => {
    const { username } = req.body;
    const challenge = generateChallenge();
    challenges[username] = challenge;

    // Construct the options for the frontend
    const options = {
        challenge,
        rp: { id: rpId, name: 'VLOO_POWER_SYSTEM_V6' },
        user: { 
            id: Buffer.from(username).toString('base64url'), // ID must be buffered
            name: username, 
            displayName: username 
        },
        pubKeyCredParams: [
            { type: 'public-key', alg: -7 },   // ES256
            { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'required',
        }
    };
    res.json(options);
});

app.post('/register/finish', async (req, res) => {
    const { username, data } = req.body;
    const expectedChallenge = challenges[username];

    try {
        const verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: data,
            expectedChallenge,
            expectedOrigin,
            expectedRPID: rpId,
        });

        if (verification.verified) {
            users[username] = verification.registrationInfo;
            return res.status(200).send({ verified: true });
        }
    } catch (error) {
        console.error("Reg Fail:", error.message);
        res.status(400).send({ error: error.message });
    }
});

// --- LOGIN ---
app.post('/login/start', (req, res) => {
    const { username } = req.body;
    if (!users[username]) return res.status(404).json({ error: "User not found" });

    const challenge = generateChallenge();
    challenges[username] = challenge;

    res.json({
        challenge,
        rpId,
        allowCredentials: [{
            type: 'public-key',
            id: users[username].credentialID,
            transports: users[username].transports || ['internal'],
        }],
        userVerification: 'required',
    });
});

app.post('/login/finish', async (req, res) => {
    const { username, data } = req.body;
    const user = users[username];

    try {
        const verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            response: data,
            expectedChallenge: challenges[username],
            expectedRPID: rpId,
            expectedOrigin,
            authenticator: {
                credentialID: user.credentialID,
                credentialPublicKey: user.credentialPublicKey,
                counter: user.counter,
            },
        });

        if (verification.verified) {
            // Update counter to prevent replay attacks
            users[username].counter = verification.authenticationInfo.newCounter;
            return res.json({ verified: true });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SYSTEM_CORE: Secure on port ${PORT}`));
