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

![image](https://github.com/user-attachments/assets/6ce4d572-d608-43c2-ba62-e7e7f0ba976b)
