// // Explicitly load variables from the .env.local file
async function testGoogleApiConnection() {
    // Get API Key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
        console.error(
            "\x1b[31m%s\x1b[0m", // Red
            "ERROR: GEMINI_API_KEY tidak ditemukan di file .env.local"
        );
        console.error(
            "Pastikan file .env.local ada di direktori yang sama dan berisi baris GEMINI_API_KEY=..."
        );
        return;
    }

    console.log("Mencoba menghubungi Google Generative AI API...");

    try {
        // Use the built-in fetch from Node.js v18+
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": apiKey,
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "hello" }] }],
                }),
            }
        );

        console.log(`Status Respons: ${response.status}`);
        const data = await response.json();

        if (response.ok) {
            console.log("\x1b[32m%s\x1b[0m", "\n✅ SUKSES! Koneksi berhasil.");
            console.log("Respons:", data);
        } else {
            console.error(
                "\x1b[31m%s\x1b[0m",
                "\n❌ GAGAL! Server merespons dengan error."
            );
            console.error("Detail Error:", data);
        }
    } catch (error) {
        console.error(
            "\x1b[31m%s\x1b[0m", // Red
            "\n❌ KESALAHAN KRITIS: Gagal melakukan fetch. Ini adalah masalah jaringan."
        );
        console.error("Detail:", error.message);
        console.log("Periksa antivirus, atau pengaturan Proxy/VPN Anda.");
    }
}

testGoogleApiConnection();
