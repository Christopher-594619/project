// controller/payments/momoGateway.js
//
// A fake mobile-money gateway for demo purposes — there is no real MTN /
// Airtel / Zamtel integration here. It resolves synchronously (with a
// short artificial delay) instead of via webhook, which keeps the whole
// payment flow demoable in one request/response cycle.

const SUPPORTED_PROVIDERS = ["mtn", "airtel", "zamtel"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Deterministic test hooks so markers/teammates can reliably demo both
// paths without relying on random chance:
//   - a number ending in 0000 always fails ("insufficient funds")
//   - everything else succeeds ~90% of the time
async function chargeMobileMoney({ provider, msisdn, amount }) {
    await sleep(600);

    if (!SUPPORTED_PROVIDERS.includes(provider)) {
        return { success: false, reason: `Unsupported provider: ${provider}` };
    }
    if (!/^0?9\d{8}$/.test(msisdn) && !/^0?7\d{8}$/.test(msisdn)) {
        return { success: false, reason: "Invalid mobile money number." };
    }

    if (msisdn.endsWith("0000")) {
        return { success: false, reason: "Insufficient funds." };
    }

    const succeeds = Math.random() < 0.9;
    if (!succeeds) {
        return { success: false, reason: "Transaction declined by mobile money provider." };
    }

    return {
        success: true,
        reference: `${provider.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    };
}

module.exports = { chargeMobileMoney, SUPPORTED_PROVIDERS };
