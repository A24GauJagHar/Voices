using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UIElements;

public class ApiClient : MonoBehaviour
{
    const string BASE_URL = "http://localhost:3000";

    TextField inputText;
    Label encryptedLabel;
    Label decryptedLabel;

    TextField passwordField;
    Label hashLabel;
    Label verifyLabel;

    void Start()
    {
        var root = GetComponent<UIDocument>().rootVisualElement;

        inputText = root.Q<TextField>("inputText");
        encryptedLabel = root.Q<Label>("encryptedLabel");
        decryptedLabel = root.Q<Label>("decryptedLabel");

        passwordField = root.Q<TextField>("passwordField");
        hashLabel = root.Q<Label>("hashLabel");
        verifyLabel = root.Q<Label>("verifyLabel");

        root.Q<Button>("encryptBtn").clicked += Encrypt;
        root.Q<Button>("decryptBtn").clicked += Decrypt;
        root.Q<Button>("hashBtn").clicked += GenerateHash;
        root.Q<Button>("verifyBtn").clicked += Verify;
    }

    void Encrypt()
    {
        StartCoroutine(Post("/encrypt", "{\"text\":\"" + inputText.value + "\"}", res =>
        {
            encryptedLabel.text = JsonUtility.FromJson<EncryptResponse>(res).encrypted;
        }));
    }

    void Decrypt()
    {
        StartCoroutine(Post("/decrypt", "{\"encrypted\":\"" + encryptedLabel.text + "\"}", res =>
        {
            decryptedLabel.text = JsonUtility.FromJson<DecryptResponse>(res).text;
        }));
    }

    void GenerateHash()
    {
        StartCoroutine(Post("/hash", "{\"password\":\"" + passwordField.value + "\"}", res =>
        {
            hashLabel.text = JsonUtility.FromJson<HashResponse>(res).hash;
        }));
    }

    void Verify()
    {
        StartCoroutine(Post("/verify", "{\"password\":\"" + passwordField.value + "\"}", res =>
        {
            bool ok = JsonUtility.FromJson<VerifyResponse>(res).ok;
            verifyLabel.text = ok ? "Correcte" : "Incorrecte";
        }));
    }

    IEnumerator Post(string route, string json, System.Action<string> callback)
    {
        var req = new UnityWebRequest(BASE_URL + route, "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
        req.uploadHandler = new UploadHandlerRaw(bodyRaw);
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");

        yield return req.SendWebRequest();
        callback(req.downloadHandler.text);
    }

    [System.Serializable] class EncryptResponse { public string encrypted; }
    [System.Serializable] class DecryptResponse { public string text; }
    [System.Serializable] class HashResponse { public string hash; }
    [System.Serializable] class VerifyResponse { public bool ok; }
}
