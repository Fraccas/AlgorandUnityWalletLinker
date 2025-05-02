exports.ConfirmWallet = async (req, res) => {
  const userId = req.jwt.userId;
  const wallet = req.body.wallet;
  const appName = "fracctal";

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
        const expectedNote = `${appName}-${userId}`;
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
