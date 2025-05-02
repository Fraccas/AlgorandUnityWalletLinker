public class WalletLinker : MonoBehaviour
{
    public InputField walletInput;
    public Button submitWalletButton;
    public Button confirmWalletButton;
    public Text statusText;

    private string currentWallet = "";
    private string appName = "fracctal";

    void Start()
    {
        string wallet = Authenticator.Get().GetUserData().wallet;
        bool verified = Authenticator.Get().GetUserData().wallet_verified;

        if (!string.IsNullOrEmpty(wallet) && verified)
        {
            walletInput.text = wallet;
            walletInput.interactable = false;
            submitWalletButton.interactable = false;
            confirmWalletButton.gameObject.SetActive(false);
            statusText.color = Color.green;
            statusText.text = "✅ Wallet is linked";
        }
        else
        {
            submitWalletButton.onClick.AddListener(GenerateVerifyLink);
            confirmWalletButton.onClick.AddListener(ConfirmWallet);
            confirmWalletButton.gameObject.SetActive(false);
        }
    }

    void GenerateVerifyLink()
    {
        currentWallet = walletInput.text.Trim();
        if (currentWallet.Length < 40)
        {
            statusText.text = "Invalid wallet address.";
            return;
        }

        string userId = ApiClient.Get().UserID;
        string note = $"{appName}-{userId}";

        if (Application.isMobilePlatform)
            Application.OpenURL($"algorand://{currentWallet}?amount=0&note={note}");
        else
            Application.OpenURL($"https://perawallet.app/qr-code-generator/result?reason=Verify+Wallet&address={currentWallet}&amount=0&note={note}");

        statusText.text = "Sign the transaction, then click Confirm.";
        confirmWalletButton.gameObject.SetActive(true);
    }

    async void ConfirmWallet()
    {
        if (ApiClient.Get().IsConnected())
        {
            string url = ApiClient.ServerURL + "/users/wallet/confirm";
            string json = ApiTool.ToJson(new ConfirmWalletRequest { wallet = currentWallet });
            var response = await ApiClient.Get().SendRequest(url, "POST", json);

            if (response.success)
            {
                statusText.color = Color.green;
                statusText.text = "✅ Wallet linked successfully!";
                walletInput.interactable = false;
                submitWalletButton.interactable = false;
                confirmWalletButton.gameObject.SetActive(false);
            }
            else
            {
                statusText.color = Color.red;
                statusText.text = "❌ Wallet confirmation failed:\n" + response.GetError();
            }
        }
    }
}
