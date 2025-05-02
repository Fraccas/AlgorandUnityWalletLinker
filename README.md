# Unity + Node.js Algorand Wallet Linking with Pera Wallet

This repo demonstrates how to securely link and verify Algorand wallets from a Unity game using Pera Wallet deep linking (mobile) or QR codes (desktop).

---

## 💡 Why?

The official Unity SDK for Algorand is deprecated. WalletConnect v2 integration is non-trivial. This method is lightweight, secure, and works without WalletConnect or custodial wallets.

---

## 🔁 How it Works

1. User enters their wallet address in Unity.
2. Game generates a **zero ALGO transaction** request using:
   - Deep link on mobile
   - QR code on desktop
3. User signs the transaction with Pera Wallet.
4. Game calls your Node.js API to confirm ownership by:
   - Fetching recent transactions via indexer
   - Looking for a note `{appName}-{userId}` within last 5 minutes

---

## 🔧 Backend Setup

In your `users.controller.js`, add:

```js
exports.ConfirmWallet = async (req, res) => {
  const userId = req.jwt.userId;
  const wallet = req.body.wallet;

  if (!wallet || typeof wallet !== "string")
    return res.status(400).send({ error: "Missing wallet address" });

  const user = await UserModel.getById(userId);
  if (!user) return res.status(404).send({ error: "User not found" });

  const url = `https://mainnet-idx.algonode.cloud/v2/accounts/${wallet}/transactions?limit=10&tx-type=pay`;

  try {
    const response = await axios.get(url);
    const txns = response.data.transactions;

    const match = txns.find(txn => {
      const noteBase64 = txn.note;
      const isZero = txn["payment-transaction"]?.amount === 0;
      const isSender = txn.sender === wallet;
      if (!noteBase64 || !isSender || !isZero) return false;

      try {
        const noteString = Buffer.from(noteBase64, 'base64').toString('utf8');
        const expectedNote = `fracctaltcg-${userId}`;
        const now = Math.floor(Date.now() / 1000);
        const txnTime = txn["round-time"];
        return noteString === expectedNote && Math.abs(now - txnTime) <= 300;
      } catch {
        return false;
      }
    });

    if (!match)
      return res.status(403).send({ error: "Verification transaction not found or invalid." });

    user.wallet = wallet;
    user.wallet_verified = true;
    await UserModel.save(user, ["wallet", "wallet_verified"]);

    return res.status(200).send({ success: true, wallet });
  } catch (err) {
    return res.status(500).send({ error: "Indexer fetch failed" });
  }
};
```
