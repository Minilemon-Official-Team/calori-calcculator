/**
 * Returns a static motivational message based on the user's net calorie result for the day.
 * This function provides simple, rule-based feedback and does not involve any AI.
 * @param netCalories The net calories (calories in - calories out) for the day.
 * @returns A motivational string.
 */
export async function getMotivationMessage(netCalories: number) {
    if (netCalories < 0) {
        return "Luar biasa! Kamu membakar lebih banyak kalori daripada yang kamu konsumsi hari ini 🔥";
    } else if (netCalories < 300) {
        return "Kamu menjaga keseimbangan kalori dengan baik 💪 pertahankan rutinitas ini!";
    } else if (netCalories < 800) {
        return "Kamu sedikit surplus hari ini — tidak apa-apa, tapi besok coba tambahkan sedikit aktivitas 🚶‍♂️";
    } else {
        return "Kamu surplus kalori cukup banyak hari ini 🍔 Coba kurangi cemilan malam!";
    }
}
