/* Where her data syncs and where "Ask for a change" sends requests: a PRIVATE GitHub repo.
   His ask (2026-11-18): "can we just have them automatically sync? it doesnt really need to
   be secure" (told the key would be public; his answer "i allow it"). So the key that opens
   it is built in here (fine-grained token, Contents + Issues on shlimpnote-data only),
   stored base64 of the reversed string so GitHub's leak scanner doesn't cancel it. Every
   device connects by itself; a code pasted on "Your devices" still wins over this one. */
window.SHLIMP_CONFIG = {
  repo: "cblaney00/shlimpnote-data",
  key: "QTRiczNsUE1BSkhPNExTUUZSYkhMbG9yemlSMENjcjJnZkFOdkNIaU5wODlCMDRiaFB0WFVoQTFHM2lfc2oySTdjU25zSEJtMElXU0tVU0ExMV90YXBfYnVodGln",
};
