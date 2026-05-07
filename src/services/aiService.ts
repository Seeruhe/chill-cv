type ArchiveResponse = {
  answer?: string;
  error?: string | {message?: string};
};

export async function askAboutResume(
  question: string,
  language: string = "English",
  topic?: string,
) {
  try {
    const response = await fetch("/api/ask-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        language,
        ...(topic ? {topic} : {}),
      }),
    });

    const data = (await response.json()) as ArchiveResponse;

    if (!response.ok) {
      console.error("Archive API Error:", data.error || response.statusText);
      return "Error connecting to the archive. The signal is weak.";
    }

    return (
      data.answer?.trim() ||
      "The archive is currently unresponsive. Please try again later."
    );
  } catch (error) {
    console.error("Archive API Error:", error);
    return "Error connecting to the archive. The signal is weak.";
  }
}
